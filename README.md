# Rebalancing Monitoring Dashboard

A monitoring dashboard for the **Listed Equities Rebalancing** Dagster pipelines.
Two pipelines write to the same delta tables — **Rebalancing** (full, 7 fixed
daily windows) and **Rebalancing Lite** (frequent intraday source refreshes) —
and this UI shows the status of each run and of every asset it materializes,
using green / amber / red dots for **success / cached / failure**.

Built for a non-technical audience (traders, Excel users) — clean, minimal, and
quick to browse.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict). No runtime UI
dependencies beyond React.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000  (mock data)
```

```bash
npm run build && npm run start   # production
```

By default the app serves deterministic **mock data**. To connect the real
Flask/REST backend, see [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) — it's a
config change, no code edits required.

## Features

- **Health banner** — the latest day's Full-pipeline checkpoints at a glance:
  overall verdict, success / cached / failed counts, and the 7 scheduled run
  dots (click one for details).
- **Day-grouped runs table** — every run from both pipelines, tagged with a
  **Pipeline** column; collapsible days; click a run to expand its per-asset
  breakdown (asset · data freshness · status message).
- **Search** across run id, window, pipeline, asset, and message.
- **Pagination** — 5 days per page, with older history behind Newer/Older.
- **Light / dark mode** — persisted, applied before first paint (no flash).

## Project layout

```
app/                 routes, layout, global styles, icon
components/
  ui/                presentational primitives (Dot, ThemeToggle)
  dashboard/         feature components (table, banner, drawer, …)
hooks/               useRunsTable — the table view-model
lib/
  pipeline/          domain types, constants, selectors, data sources
  env.ts             server-only config
middleware.ts        per-request CSP nonce + security headers
docs/                architecture, API integration, security, data model
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — layers, data flow, design patterns
- [API Integration](docs/API_INTEGRATION.md) — wiring the real Flask/REST backend + manual refresh
- [Security](docs/SECURITY.md) — CSP, headers, secret handling
- [Data Model](docs/DATA_MODEL.md) — the domain types

## Configuration

Copy `.env.example` to `.env.local`. All variables are **server-only** (never
`NEXT_PUBLIC_`). With no config, the app runs on mock data.

## Notes

- Next.js is pinned to a release patched against CVE-2025-66478. Two moderate
  transitive advisories (postcss via Next) remain across all 15.x; resolving
  them requires a breaking major bump.
- The dashboard is read-only and has no built-in auth — deploy it behind your
  SSO/identity proxy.
