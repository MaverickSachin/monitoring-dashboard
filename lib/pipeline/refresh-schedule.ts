import { LITE_WINDOWS, RUN_WINDOWS } from "./constants";

/**
 * Refresh cadence driven by the pipeline schedules: instead of blind polling,
 * the UI refreshes shortly after each run is expected to have produced output.
 * Full runs take up to ~10 min, Lite ~5–10 min; we wait the upper bound plus a
 * small grace so the query lands on a completed write.
 */
const FULL_DURATION_MIN = 10;
const LITE_DURATION_MIN = 10;
const GRACE_MIN = 2;
const DAY_MIN = 24 * 60;

const toMin = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Minutes-of-day at which each run's output is expected to be queryable. */
const OUTPUT_READY_MIN: number[] = (() => {
  const out: number[] = [];
  for (const w of RUN_WINDOWS) out.push(toMin(w.time) + FULL_DURATION_MIN + GRACE_MIN);
  for (const lw of LITE_WINDOWS) {
    for (const t of lw.times) out.push(toMin(t) + LITE_DURATION_MIN + GRACE_MIN);
  }
  return [...new Set(out)].sort((a, b) => a - b);
})();

/**
 * Milliseconds from `now` until the next moment a pipeline output is expected.
 * After the last run of the day, rolls over to the first run of the next day.
 */
export function msUntilNextRefresh(now: Date): number {
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const next = OUTPUT_READY_MIN.find((m) => m > nowMin);
  const deltaMin = next != null ? next - nowMin : DAY_MIN - nowMin + OUTPUT_READY_MIN[0];
  return Math.max(1000, Math.ceil(deltaMin * 60_000));
}
