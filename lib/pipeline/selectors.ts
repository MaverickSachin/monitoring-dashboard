import type { Counts, Day, Run, Status } from "./types";

/** Stable identity for a run, used for React keys and open/closed state. */
export const runKey = (run: Run): string => `${run.date}_${run.pipeline}_${run.time}`;

/** Tally a run's assets by status. */
export function countAssets(run: Run): Counts {
  const c: Counts = { s: 0, c: 0, f: 0 };
  for (const a of run.assets) c[a.status]++;
  return c;
}

/** Tally any list of runs by status. */
export function countByStatus(runs: Run[]): Counts {
  const c: Counts = { s: 0, c: 0, f: 0 };
  for (const r of runs) c[r.status]++;
  return c;
}

/** Tally all of a day's runs by status. */
export function countRuns(day: Day): Counts {
  return countByStatus(day.runs);
}

/** Roll a set of asset statuses up to a single run status (worst wins). */
export function rollUp(statuses: Status[]): Status {
  if (statuses.includes("f")) return "f";
  if (statuses.includes("c")) return "c";
  return "s";
}

/** Compact asset breakdown, e.g. "18 Ok · 2 Cached". */
export function assetBreakdown(run: Run): string {
  const c = countAssets(run);
  const parts: string[] = [];
  if (c.s) parts.push(`${c.s} Ok`);
  if (c.c) parts.push(`${c.c} Cached`);
  if (c.f) parts.push(`${c.f} Failed`);
  return parts.join(" · ");
}

/** Generic, pipeline-level summary of a run — never a single asset's note. */
export function runSummary(run: Run): string {
  const c = countAssets(run);
  const n = run.assets.length;
  if (c.f) return `${c.f} of ${n} assets failed to materialize`;
  if (c.c) return `${c.c} of ${n} assets served from cache`;
  return `All ${n} assets materialized successfully`;
}
