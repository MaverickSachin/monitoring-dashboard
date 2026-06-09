# FastAPI Integration

The dashboard ships with deterministic mock data. Wiring the real FastAPI
backend touches **exactly two files** and **zero UI components**.

## TL;DR

```bash
cp .env.example .env.local
# .env.local
PIPELINE_DATA_SOURCE=api
PIPELINE_API_BASE_URL=https://pipeline-api.internal
PIPELINE_API_TOKEN=<server-side token>
PIPELINE_API_DAYS=20
```

That's it — `lib/pipeline/data-source.ts` will select
`ApiPipelineDataSource` and the UI renders live data.

## Where the integration lives

| Concern | File |
| --- | --- |
| Choose mock vs. api | `lib/pipeline/data-source.ts` |
| HTTP call, DTOs, mappers | `lib/pipeline/fastapi-client.ts` |
| Config & secrets | `lib/env.ts` / `.env.local` |

## Expected endpoint

`ApiPipelineDataSource.getDays()` issues:

```
GET {PIPELINE_API_BASE_URL}/runs?days={N}
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
        "run_no": 3,
        "window": "Market open",
        "window_key": "market_open",
        "scheduled_time": "09:00",
        "date": "2026-06-09",
        "assets": [
          {
            "name": "positions_aladdin",
            "resource": "Aladdin",
            "status": "success",      // "success" | "cached" | "failure" | "pending"
            "freshness": "Current",   // "Current" | "Cached" | "Stale" | "Pending"
            "message": "Aladdin position data loaded"
          }
        ]
      }
    ]
  }
]
```

## If the backend shape differs

Runs whose scheduled time hasn't passed should be reported with
`status: "pending"` (and `freshness: "Pending"`); the UI renders them as hollow
dots and excludes them from the day's "complete" count. Alternatively, omit
future runs entirely.

Don't change the UI — change the **mappers**. In `fastapi-client.ts`:

- `AssetDTO`, `RunDTO`, `DayDTO` describe the wire format.
- `toAsset` / `toRun` / `toDay` translate wire → domain (`Asset`/`Run`/`Day`).
- `STATUS_FROM_API` maps backend status strings to the internal codes.

Adjust those and the rest of the app is unaffected.

## Sourcing from Dagster / Databricks

The per-asset rows (`resource`, `status`, `freshness`, `message`) come from the
Databricks delta table the pipeline writes. The FastAPI service is expected to
join the Dagster run metadata (run window, schedule time) with that table and
return the shape above. `run_no` / `window_key` correspond to the schedule
`run_window` tags (`overnight`, `pre_market`, … `post_market`).

## Caching & freshness

`getDays()` uses `fetch(..., { next: { revalidate: 30 } })` — Next caches the
response server-side for 30s. Tune to match how often runs update, or switch to
`cache: "no-store"` for always-live data.

## Client-side fetching (optional)

Today the call is server-side, so the browser only talks to the Next server and
`connect-src 'self'` suffices. If you later fetch from the client, add the API
origin to `connect-src` in `middleware.ts`.

## Error handling

Non-2xx responses throw; wrap the route in an `app/error.tsx` boundary (or a
`try/catch` in `page.tsx`) to render a friendly failure state. Never surface the
token or raw upstream errors to the client.
