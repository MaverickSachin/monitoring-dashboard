# API Integration (Flask / REST)

The dashboard ships with deterministic mock data. The data layer is
**backend-agnostic** — it depends only on the `PipelineDataSource` interface, so
wiring the existing **Flask** API (or any HTTP service) touches **two files** and
**zero UI components**.

## TL;DR

```bash
cp .env.example .env.local
# .env.local
PIPELINE_DATA_SOURCE=api
PIPELINE_API_BASE_URL=https://pipeline-api.internal
PIPELINE_API_RUNS_PATH=/runs
PIPELINE_API_TOKEN=<server-side token>
PIPELINE_API_DAYS=20
```

That's it — `lib/pipeline/data-source.ts` selects `ApiPipelineDataSource` and the
UI renders live data.

## Where the integration lives

| Concern | File |
| --- | --- |
| Choose mock vs. api | `lib/pipeline/data-source.ts` |
| HTTP call, DTOs, mappers | `lib/pipeline/api-client.ts` |
| Refresh cadence | `lib/pipeline/refresh-schedule.ts` + `components/AutoRefresh.tsx` |
| Config & secrets | `lib/env.ts` / `.env.local` |

## Expected endpoint

`ApiPipelineDataSource.getDays()` issues:

```
GET {PIPELINE_API_BASE_URL}{PIPELINE_API_RUNS_PATH}?days={N}
Authorization: Bearer {PIPELINE_API_TOKEN}
Accept: application/json
```

Expected response — recent business days, **newest first**:

```jsonc
[
  {
    "date": "2026-06-09",
    "runs": [
      {
        "id": "3227d408",
        "pipeline": "full",        // "full" | "lite"
        "run_no": 3,               // full runs only; omit for lite
        "window": "Market open",
        "window_key": "market_open",
        "scheduled_time": "09:00",
        "date": "2026-06-09",
        "assets": [
          {
            "name": "positions_aladdin",
            "resource": "Aladdin",
            "status": "success",      // "success" | "cached" | "failure"
            "freshness": "Current",   // "Current" | "Cached" | "Stale"
            "message": "Aladdin position data loaded"
          }
        ]
      }
    ]
  }
]
```

Today's payload should include **only runs that have executed** — future runs
simply aren't returned yet (the UI shows "N runs today" growing through the day).

## If the backend shape differs

Don't change the UI — change the **mappers** in `api-client.ts`:

- `AssetDTO`, `RunDTO`, `DayDTO` describe the wire format.
- `toAsset` / `toRun` / `toDay` translate wire → domain (`Asset`/`Run`/`Day`).
- `STATUS_FROM_API` maps backend status strings to the internal codes.

Adjust those and the rest of the app is unaffected.

## Auto-refresh (schedule-aware)

The UI re-pulls data on a cadence tied to the pipeline schedules rather than
blind polling — see `lib/pipeline/refresh-schedule.ts` and
`components/AutoRefresh.tsx`:

- It waits until just after each run is expected to finish (Full ≤10 min, Lite
  5–10 min, + a short grace), then calls `router.refresh()`.
- `router.refresh()` re-runs the **server** fetch and streams fresh data in,
  preserving the user's open/search state. The Flask call and token stay
  server-side; the browser only talks to the Next server (so `connect-src 'self'`
  remains sufficient — no token in the client).
- Tune the durations/grace in `refresh-schedule.ts` if a pipeline's runtime
  changes.

The runs fetch uses `cache: "no-store"`, so each refresh lands on the latest
output instead of a cached copy.

## Tagging the pipeline (Full vs Lite)

Both pipelines write to the same delta tables, so each write must be attributed.
The schedules are deterministic, so the backend can tag every run:

1. **Timestamp → schedule match** (primary): match the write time to the nearest
   cron time within a tolerance — 09:00 ⇒ Full, 09:15/09:30/… ⇒ Lite.
2. **Asset coverage** (corroboration): a write touching reconciliation/pricing
   must be Full (Lite only writes its 5-asset source subset).

Do this in the API so the UI just reads `pipeline`. A third pipeline,
**Forecasting**, runs ~06:00 daily with only a couple of assets; the live mapper
classifies it by that signature (early-morning + tiny asset count).

## Sourcing from Dagster / Databricks

The per-asset rows (`resource`, `status`, `freshness`, `message`) come from the
Databricks delta table the pipeline writes. The Flask service joins the Dagster
run metadata (run window, schedule time) with that table and returns the shape
above. `run_no` / `window_key` correspond to the schedule `run_window` tags
(`overnight`, `pre_market`, … `post_market`).

## Error handling

Non-2xx responses throw; wrap the route in an `app/error.tsx` boundary (or a
`try/catch` in `page.tsx`) to render a friendly failure state. Never surface the
token or raw upstream errors to the client.
