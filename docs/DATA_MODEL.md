# Data Model

Defined in `lib/pipeline/types.ts`. These types are the contract between the
data source and the UI.

## Status

```ts
type Status = "s" | "c" | "f"; // success | cached | failure
```

Rendered as green / amber / red dots. A run's status rolls up from its assets,
worst-wins (any failure → failure; else any cached → cached; else success).

## Asset

One materialization within a run.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `string` | asset key, e.g. `positions_aladdin` |
| `resource` | `string` | upstream system: Aladdin / IDM / Bloomberg / Internal |
| `status` | `Status` | materialization outcome |
| `freshness` | `Freshness` | `"Current"` \| `"Cached"` \| `"Stale"` |
| `message` | `string` | data status message |

## Pipeline

```ts
type Pipeline = "full" | "lite";
```

Two pipelines write to the **same** delta tables, so a run is tagged with which
one produced it (`Rebalancing` / `Rebalancing Lite`):

- **Full** (`leq_rebalancing_*`) — 7 fixed daily windows, materializes all ~20
  assets across every resource.
- **Lite** (`leq_rebalancing_lite_*`) — frequent intraday refreshes (13/day),
  materializes only the 5 source assets (`trades_aladdin`, `positions_aladdin`,
  `portfolio_group_aladdin`, `cash_forecaster_export_schedule`, `policy_tree`).

(Forecasting exists too but is out of scope for now.)

## Run

One scheduled execution of a pipeline.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | run id |
| `pipeline` | `Pipeline` | `"full"` or `"lite"` |
| `runNo` | `number?` | 1–7 for full runs; absent for lite |
| `window` / `windowKey` | `string` | `"Market open"` / `"market_open"`, or `"Intraday"` / `"lite_intraday"` |
| `time` | `string` | schedule time, `"09:00"` (Australia/Melbourne) |
| `date` | `string` | ISO date |
| `status` | `Status` | rolled up from `assets` |
| `assets` | `Asset[]` | ~20 for full, 5 for lite |

## Day

A business day grouping its runs (full + lite, sorted by time). `weekday` /
`dateLabel` are presentation helpers; `tag` is `"Today"` / `"Yesterday"` / `""`.

## Schedules

Full windows (`RUN_WINDOWS`) and the Lite schedule (`LITE_WINDOWS`) in
`lib/pipeline/constants.ts` mirror the Dagster ScheduleDefinitions:

| Pipeline | Window | Times | `windowKey` |
| --- | --- | --- | --- |
| Full | Overnight / Pre-market / Market open / Mid-morning / Afternoon / Late afternoon / Post-market | 00:30, 07:00, 09:00, 10:30, 15:00, 16:00, 17:00 | `overnight` … `post_market` |
| Lite | Opening | 09:15, 09:30, 09:45 | `lite_opening` |
| Lite | Mid-morning | 10:00, 10:15 | `lite_midmorning` |
| Lite | Intraday | 11:00 → 14:30 (every 30 min) | `lite_intraday` |
