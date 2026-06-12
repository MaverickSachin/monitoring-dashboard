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
PIPELINE_API_RUNS_PATH=/pipeline_run_audit_summary
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
| Manual refresh | `components/ui/RefreshButton.tsx` |
| Config & secrets | `lib/env.ts` / `.env.local` |

## Expected endpoint

`ApiPipelineDataSource.getDays()` issues:

```
GET {PIPELINE_API_BASE_URL}{PIPELINE_API_RUNS_PATH}?days={N}
Authorization: Bearer {PIPELINE_API_TOKEN}
Accept: application/json
```

Expected response — a **columnar** table, one row per asset materialization
(the shape Databricks SQL returns). Rows may arrive in any order; the mapper
groups them by `run_id` and `time_stamp`:

```jsonc
{
  "columns": [
    "run_id", "time_stamp", "pipeline", "layer", "schema_name",
    "table_name", "fully_qualified_name", "freshness", "row_count",
    "cached_from_run_id", "status_message", "created_at"
  ],
  "result": [
    [
      "f315298f-4fcd-42ee-bac8-5e6b23cdfac9", // run_id
      "2026-06-12T06:58:21.195+10:00",        // time_stamp (run-level)
      "rebalancing_lite",                     // pipeline: rebalancing | rebalancing_lite | forecasting
      "publication",                          // layer
      "dp_leq_rebalancing_pub",               // schema_name
      "positions_aladdin",                    // table_name  → asset name
      "inv_dev.dp_leq_rebalancing_pub.positions_aladdin",
      "current",                              // freshness: current | cached | stale  → status
      "835",                                  // row_count
      null,                                   // cached_from_run_id (source run is also in the message)
      "Aladdin Positions loaded successfully",// status_message → asset message
      "2026-06-12T06:54:59.785+10:00"         // created_at (per-asset)
    ]
  ],
  "types": ["str", "datetime64[ns]", "str", "str", "str", "str", "str", "str", "str", "str", "str", "datetime64[ns]"]
}
```

The endpoint records everything the UI needs **directly** — no inference:

- `pipeline` tags the run (`rebalancing` → Full, `rebalancing_lite` → Lite,
  `forecasting` → Forecasting), so there is no count/time-based classifier.
- `freshness` is the single source of run/asset status: `current` → success,
  `cached` → cached (served from a prior run), `stale` → failure.

Today's payload should include **only runs that have executed** — future runs
simply aren't returned yet (the UI shows "N runs today" growing through the day).

## If the backend shape differs

Don't change the UI — change the **mappers** in `api-client.ts`:

- `RunAuditSummaryResponse` describes the columnar wire format (`columns`/`result`).
- `runAuditSummaryToDays` groups rows → runs → days and builds the domain `Day[]`.
- `STATUS_FROM_FRESHNESS` maps the `freshness` value to the internal status code;
  `PIPELINE_FROM_API` maps the `pipeline` value to the domain pipeline.
- `resourceFor` infers the upstream system from the asset (`table_name`).

Adjust those and the rest of the app is unaffected.

## Refresh (manual)

Data only re-pulls when the user clicks the **Refresh** button in the header —
no polling, no background timers. See `components/ui/RefreshButton.tsx`:

- The click calls `router.refresh()` inside a transition, which re-runs the
  **server** fetch and streams fresh data in, preserving the user's open/search
  state. The Flask call and token stay server-side; the browser only talks to
  the Next server (so `connect-src 'self'` remains sufficient — no token in the
  client).
- `isPending` stays true for the whole round-trip, so the button shows a live
  "Refreshing…" state.

The runs fetch uses `cache: "no-store"`, so each click lands on the latest
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
