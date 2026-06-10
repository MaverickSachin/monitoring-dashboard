import type { Pipeline, RunWindow, Status } from "./types";

/** Short, human-readable label per status. */
export const STATUS_LABEL: Record<Status, string> = {
  s: "Success",
  c: "Cached",
  f: "Failure",
};

/** Phrase used for a run's overall status in summaries. */
export const STATUS_PHRASE: Record<Status, string> = {
  s: "All Success",
  c: "Cached",
  f: "Has Failures",
};

/** Display name per pipeline. */
export const PIPELINE_LABEL: Record<Pipeline, string> = {
  full: "Rebalancing",
  lite: "Rebalancing Lite",
};

/**
 * The 7 daily Full-pipeline run windows, in schedule order — mirrors the
 * Dagster ScheduleDefinitions (leq_rebalancing_run_1..7). Times are
 * Australia/Melbourne.
 */
export const RUN_WINDOWS: readonly RunWindow[] = [
  { no: 1, key: "overnight", name: "Overnight", time: "00:30" },
  { no: 2, key: "pre_market", name: "Pre-market", time: "07:00" },
  { no: 3, key: "market_open", name: "Market open", time: "09:00" },
  { no: 4, key: "mid_morning", name: "Mid-morning", time: "10:30" },
  { no: 5, key: "afternoon", name: "Afternoon", time: "15:00" },
  { no: 6, key: "late_afternoon", name: "Late afternoon", time: "16:00" },
  { no: 7, key: "post_market", name: "Post-market", time: "17:00" },
];

/**
 * The Lite refresh schedule (leq_rebalancing_lite_*) — frequent intraday
 * source-data refreshes grouped into three windows.
 */
export const LITE_WINDOWS: readonly { key: string; name: string; times: string[] }[] = [
  { key: "lite_opening", name: "Opening", times: ["09:15", "09:30", "09:45"] },
  { key: "lite_midmorning", name: "Mid-morning", times: ["10:00", "10:15"] },
  {
    key: "lite_intraday",
    name: "Intraday",
    times: ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
  },
];

/** Asset keys the Lite pipeline refreshes (source data only) — mock dataset. */
export const LITE_ASSET_KEYS: readonly string[] = [
  "trades_aladdin",
  "positions_aladdin",
  "portfolio_group_aladdin",
  "cash_forecaster_export_schedule",
  "policy_tree",
];

/**
 * Live-data pipeline classification: Lite runs write far fewer assets than Full
 * (~2–4 vs ~13–17), so a run is Lite when its asset count is at or below this
 * threshold (well inside the gap); Full otherwise.
 */
export const LITE_MAX_ASSETS = 8;
