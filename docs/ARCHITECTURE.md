# Architecture

A small, layered Next.js (App Router) app. The guiding rule: **the UI depends
on a domain model and a data-source interface — never on a concrete backend.**
Swapping mock data for the real FastAPI service is a one-line config change.

## Layers

```
┌────────────────────────────────────────────────────────────────┐
│ app/                Routing + composition (server components)  │
│   page.tsx          fetches days via the data source           │
│   layout.tsx        html shell, fonts, theme bootstrap, nonce  │
├────────────────────────────────────────────────────────────────┤
│ components/                                                    │
│   ui/               presentational primitives (Dot, Theme)     │
│   dashboard/        feature components (table, banner, drawer) │
│ hooks/                                                         │
│   useRunsTable      table view-model: paging, search, expand   │
├────────────────────────────────────────────────────────────────┤
│ lib/pipeline/       domain (client-safe)                       │
│   types.ts          Status, Asset, Run, Day, DataSource        │
│   constants.ts      run windows, status labels                 │
│   selectors.ts      pure derivations (counts, summaries)       │
│   ─────────────── server-only ───────────────────              │
│   data-source.ts    factory: mock ↔ api                        │
│   mock-data.ts      deterministic sample dataset               │
│   fastapi-client.ts FastAPI integration (DTOs + mappers)       │
│ lib/env.ts          server-only config                         │
├────────────────────────────────────────────────────────────────┤
│ middleware.ts       per-request CSP nonce + headers            │
└────────────────────────────────────────────────────────────────┘
```

## Data flow

1. `app/page.tsx` (server component) calls `getPipelineDays()`.
2. The data-source factory returns the mock or FastAPI implementation based on
   `PIPELINE_DATA_SOURCE`. Both satisfy the `PipelineDataSource` interface.
3. Plain serializable `Day[]` is passed to `<RunsDashboard>` (client).
4. `useRunsTable` turns the data into a view-model (paging, search, expansion);
   the dashboard components stay presentational.

## Key patterns

- **Repository / strategy** — `PipelineDataSource` decouples the UI from the
  backend. Add a new source by implementing one method.
- **Server/client boundary** — domain types, constants, and selectors are
  client-safe; data access and config are marked `server-only` so tokens can
  never reach the browser bundle.
- **Container/presenter** — `useRunsTable` (logic) vs. `dashboard/*` (markup).
- **Pure selectors** — all derivations (`countAssets`, `runSummary`, …) are
  pure functions, trivially testable.

## Conventions

- TypeScript `strict`. No `any`. Domain types are the contract.
- Components are small and single-purpose; styling lives in `app/globals.css`
  via CSS custom properties (one light + one dark token set).
- Comments explain *why*, not *what*. Names carry the rest.
