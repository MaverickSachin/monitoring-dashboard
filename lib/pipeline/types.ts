/** Domain model for the Listed Equities Rebalancing pipeline monitor. */

/** Run/asset state: success, cached, failure, or pending (not yet run). */
export type Status = "s" | "c" | "f" | "p";

/** Categorical data freshness as reported by the API. */
export type Freshness = "Current" | "Cached" | "Stale" | "Pending";

/** A single asset materialized within a run. */
export interface Asset {
  name: string;
  resource: string; // upstream system, e.g. Aladdin | IDM | Bloomberg | Internal
  status: Status;
  freshness: Freshness;
  message: string; // data status message
}

/** One scheduled execution of the pipeline and its materialized assets. */
export interface Run {
  id: string;
  runNo: number; // 1..7, matching the Dagster schedule order
  window: string; // human label, e.g. "Market open"
  windowKey: string; // stable key, e.g. "market_open"
  time: string; // local schedule time, e.g. "09:00"
  date: string; // ISO date, e.g. "2026-06-09"
  status: Status; // rolled up from the assets
  assets: Asset[];
}

/** A business day grouping the runs that executed on it. */
export interface Day {
  date: string; // "2026-06-09"
  dow: string; // "Tue"
  weekday: string; // "Tuesday"
  dateLabel: string; // "9 June 2026"
  tag: string; // "Today" | "Yesterday" | ""
  runs: Run[];
}

/** Tally of assets or runs by status. */
export interface Counts {
  s: number;
  c: number;
  f: number;
  p: number;
}

/** A scheduled run window, mirroring a Dagster ScheduleDefinition. */
export interface RunWindow {
  no: number;
  key: string;
  name: string;
  time: string;
}

/**
 * Source of pipeline data. Swap the implementation (mock ↔ FastAPI) without
 * touching the UI — see lib/pipeline/data-source.ts.
 */
export interface PipelineDataSource {
  /** Recent business days with their runs, newest first. */
  getDays(): Promise<Day[]>;
}
