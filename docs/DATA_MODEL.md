# Data Model

Defined in `lib/pipeline/types.ts`. These types are the contract between the
data source and the UI.

## Status

```ts
type Status = "s" | "c" | "f" | "p"; // success | cached | failure | pending
```

Rendered as green / amber / red / hollow dots. A completed run's status rolls up
from its assets, worst-wins (any failure → failure; else any cached → cached;
else success). A run whose scheduled time hasn't passed is **pending** (`p`) —
shown as a hollow dot and excluded from the day's completed count.

## Asset

One materialization within a run.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `string` | asset key, e.g. `positions_aladdin` |
| `resource` | `string` | upstream system: Aladdin / IDM / Bloomberg / Internal |
| `status` | `Status` | materialization outcome |
| `freshness` | `Freshness` | `"Current"` \| `"Cached"` \| `"Stale"` \| `"Pending"` |
| `message` | `string` | data status message |

## Run

One scheduled execution (7 per weekday).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | run id |
| `runNo` | `number` | 1–7, schedule order |
| `window` / `windowKey` | `string` | `"Market open"` / `"market_open"` |
| `time` | `string` | schedule time, `"09:00"` (Australia/Melbourne) |
| `date` | `string` | ISO date |
| `status` | `Status` | rolled up from `assets` |
| `assets` | `Asset[]` | ~20 per full run |

## Day

A business day grouping its runs. `weekday` / `dateLabel` are presentation
helpers (`"Tuesday"`, `"9 June 2026"`); `tag` is `"Today"` / `"Yesterday"` / `""`.

## Run windows

The 7 windows in `lib/pipeline/constants.ts` mirror the Dagster schedules:

| # | Window | Time | `windowKey` |
| --- | --- | --- | --- |
| 1 | Overnight | 00:30 | `overnight` |
| 2 | Pre-market | 07:00 | `pre_market` |
| 3 | Market open | 09:00 | `market_open` |
| 4 | Mid-morning | 10:30 | `mid_morning` |
| 5 | Afternoon | 15:00 | `afternoon` |
| 6 | Late afternoon | 16:00 | `late_afternoon` |
| 7 | Post-market | 17:00 | `post_market` |
