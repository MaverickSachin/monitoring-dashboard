import "server-only";

import { LITE_MAX_ASSETS, LITE_WINDOWS, RUN_WINDOWS } from "./constants";
import { rollUp } from "./selectors";
import type { Asset, Day, Freshness, PipelineDataSource, Run, Status } from "./types";

/**
 * REST-API data source — backend-agnostic (the existing Flask `audit_data`
 * endpoint, or any HTTP service). The UI depends only on {@link PipelineDataSource};
 * this is the ONE place the backend is wired. Activate with
 * `PIPELINE_DATA_SOURCE=api` (see lib/env.ts and docs/API_INTEGRATION.md).
 */

export interface ApiConfig {
  baseUrl: string;
  runsPath: string;
  token: string;
  userId: string;
  appName: string;
  appPath: string;
  days: number;
}

// --- Wire format ---------------------------------------------------------
// The audit endpoint returns a columnar table: one row per asset write.
interface AuditResponse {
  columns: string[];
  result: unknown[][];
  types: string[];
}

// --- Derivations (the response carries no resource/freshness) ------------

const STATUS_FROM_AUDIT: Record<string, Status> = {
  SUCCESS: "s",
  CACHED: "c",
  FAILURE: "f",
  FAILED: "f",
  ERROR: "f",
};
const statusFromAudit = (value: string): Status =>
  STATUS_FROM_AUDIT[value.toUpperCase()] ?? "f";

const freshnessFor = (s: Status): Freshness =>
  s === "f" ? "Stale" : s === "c" ? "Cached" : "Current";

/** Resource inferred from the asset name (no resource column in the response). */
function resourceFor(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith("_aladdin")) return "Aladdin";
  if (n.includes("idm")) return "IDM";
  if (n.includes("bloomberg")) return "Bloomberg";
  return "Internal";
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Schedule slots (minutes-of-day → window) for naming runs by timestamp.
const FULL_SLOTS = RUN_WINDOWS.map((w) => ({ m: toMinutes(w.time), name: w.name, key: w.key, no: w.no }));
const LITE_SLOTS = LITE_WINDOWS.flatMap((w) =>
  w.times.map((t) => ({ m: toMinutes(t), name: w.name, key: w.key })),
);
const WINDOW_TOLERANCE_MIN = 90;

const nearest = <T extends { m: number }>(slots: T[], at: number): T => {
  let best = slots[0];
  for (const s of slots) if (Math.abs(s.m - at) < Math.abs(best.m - at)) best = s;
  return best;
};

/**
 * Name a run's window by snapping its actual time to the nearest schedule slot
 * (a descriptive label, not a precise schedule claim). Full runs also carry the
 * window's run number (1–7) for the "Run N" badge; off-schedule/retry runs
 * outside the tolerance get a generic label and no number.
 */
function windowFor(
  pipeline: Run["pipeline"],
  time: string,
): { window: string; windowKey: string; runNo?: number } {
  const at = toMinutes(time);
  if (pipeline === "lite") {
    const best = nearest(LITE_SLOTS, at);
    return Math.abs(best.m - at) <= WINDOW_TOLERANCE_MIN
      ? { window: `${best.name} refresh`, windowKey: best.key }
      : { window: "Lite refresh", windowKey: "lite" };
  }
  const best = nearest(FULL_SLOTS, at);
  return Math.abs(best.m - at) <= WINDOW_TOLERANCE_MIN
    ? { window: best.name, windowKey: best.key, runNo: best.no }
    : { window: "Rebalancing run", windowKey: "full" };
}

// --- Transform: audit rows -> domain ------------------------------------

/** Group rows by run_id → runs, classify pipeline, then group by date → days. */
export function auditToDays(res: AuditResponse): Day[] {
  if (!res || !Array.isArray(res.columns) || !Array.isArray(res.result)) {
    throw new Error("Unexpected audit response: expected { columns, result }");
  }
  const col = (name: string) => {
    const i = res.columns.indexOf(name);
    if (i < 0) throw new Error(`Audit response is missing the "${name}" column`);
    return i;
  };
  const iRun = col("run_id");
  const iTs = col("time_stamp");
  const iName = col("friendly_name");
  const iMsg = col("message");
  const iType = col("message_type");

  const rowsByRun = new Map<string, unknown[][]>();
  for (const row of res.result) {
    const id = String(row[iRun]);
    const arr = rowsByRun.get(id);
    if (arr) arr.push(row);
    else rowsByRun.set(id, [row]);
  }

  const runs: Run[] = [];
  for (const [runId, group] of rowsByRun) {
    let ts = String(group[0][iTs]);
    const seen = new Set<string>();
    const assets: Asset[] = [];
    for (const row of group) {
      const t = String(row[iTs]);
      if (t < ts) ts = t;
      const name = String(row[iName]);
      if (seen.has(name)) continue; // collapse duplicate writes of an asset
      seen.add(name);
      const status = statusFromAudit(String(row[iType]));
      assets.push({
        name,
        resource: resourceFor(name),
        status,
        freshness: freshnessFor(status),
        message: String(row[iMsg]),
      });
    }
    // Lite writes far fewer assets than Full — classify by count (clean gap).
    const pipeline: Run["pipeline"] = assets.length <= LITE_MAX_ASSETS ? "lite" : "full";
    const time = ts.slice(11, 16);
    runs.push({
      id: runId.slice(0, 8),
      pipeline,
      ...windowFor(pipeline, time),
      time,
      date: ts.slice(0, 10),
      status: rollUp(assets.map((a) => a.status)),
      assets,
    });
  }

  const runsByDate = new Map<string, Run[]>();
  for (const run of runs) {
    const arr = runsByDate.get(run.date);
    if (arr) arr.push(run);
    else runsByDate.set(run.date, [run]);
  }

  return [...runsByDate.keys()]
    .sort()
    .reverse() // newest day first
    .map((date, index) => {
      const d = new Date(`${date}T00:00:00`);
      return {
        date,
        dow: DOW[d.getDay()],
        weekday: WEEKDAYS[d.getDay()],
        dateLabel: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        tag: index === 0 ? "Today" : index === 1 ? "Yesterday" : "",
        runs: runsByDate.get(date)!.sort((a, b) => a.time.localeCompare(b.time)),
      };
    });
}

// --- Data source ---------------------------------------------------------

export class ApiPipelineDataSource implements PipelineDataSource {
  constructor(private readonly cfg: ApiConfig) {
    if (!cfg.baseUrl) {
      throw new Error("PIPELINE_API_BASE_URL is required when PIPELINE_DATA_SOURCE=api");
    }
  }

  async getDays(): Promise<Day[]> {
    // `no-store` so each scheduled refresh pulls the latest writes (cadence is
    // driven by AutoRefresh). TLS trust for internal certs must be handled by
    // the runtime (NODE_EXTRA_CA_CERTS) — never disable verification in code.
    const res = await fetch(`${this.cfg.baseUrl}${this.cfg.runsPath}`, {
      headers: {
        Accept: "application/json",
        ...(this.cfg.userId ? { Userid: this.cfg.userId } : {}),
        ...(this.cfg.appName ? { AppName: this.cfg.appName } : {}),
        ...(this.cfg.appPath ? { AppPath: this.cfg.appPath } : {}),
        ...(this.cfg.token ? { Authorization: `Bearer ${this.cfg.token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Pipeline API responded ${res.status} ${res.statusText}`);
    }

    return auditToDays((await res.json()) as AuditResponse);
  }
}
