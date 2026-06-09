import type { RunWindow, Status } from "./types";

/** Short, human-readable label per status. */
export const STATUS_LABEL: Record<Status, string> = {
  s: "Success",
  c: "Cached",
  f: "Failure",
};

/** Phrase used for a run's overall status in summaries. */
export const STATUS_PHRASE: Record<Status, string> = {
  s: "all success",
  c: "cached",
  f: "has failures",
};

/**
 * The 7 daily run windows, in schedule order — mirrors the Dagster
 * ScheduleDefinitions (leq_rebalancing_run_1..7). Times are Australia/Melbourne.
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
