/**
 * Deterministic mock data for local development and the default build.
 *
 * Generation is seeded (no wall-clock, no randomness) so server render and
 * client hydration always agree. Replace this source with the REST API client
 * by setting PIPELINE_DATA_SOURCE=api — see lib/pipeline/data-source.ts.
 */
import { displayAsset, LITE_ASSET_KEYS, LITE_WINDOWS, RUN_WINDOWS } from "./constants";
import { rollUp } from "./selectors";
import type { Asset, Day, Freshness, Run, Status } from "./types";

/**
 * Assets a full run materializes, in pipeline order, as `[table_name, message]`.
 * The keys mirror the real pipeline tables; the UI display name is resolved from
 * each key via {@link displayAsset}.
 */
const ASSET_TEMPLATE: ReadonlyArray<[key: string, message: string]> = [
  ["trades_aladdin", "Aladdin Trades loaded successfully"],
  ["positions_aladdin", "Aladdin Positions loaded successfully"],
  ["portfolio_group_aladdin", "Aladdin Portfolio Groups loaded successfully"],
  ["positions_notional_aladdin", "Aladdin Notional Positions loaded successfully"],
  ["positions_fx_aladdin", "Aladdin FX Positions loaded successfully"],
  ["positions_idm", "IDM Positions loaded successfully"],
  ["recs_aladdin", "Aladdin + IDM reconciliation complete"],
  ["pricing_bloomberg", "Darkstar / Bloomberg pricing loaded successfully"],
  ["benchmark_weights", "IDM Benchmark Weights loaded successfully"],
  ["policy_tree", "IDM Policy Tree loaded successfully"],
  ["policytree_diffs", "IDM Policy Tree differences computed"],
  ["cash_forecaster_export_schedule", "Cash Forecaster Export Schedule loaded successfully"],
  ["calculations", "Rebalancing calculations loaded"],
  ["calculations_trace", "Rebalancing calculations trace loaded"],
  ["dsu_board_taa", "DSU Board TAA loaded successfully"],
  ["dsu_board_eee", "DSU Board EEE loaded successfully"],
  ["dsu_runway_range", "DSU Runway Range loaded successfully"],
  ["dsu_daa", "DSU DAA loaded successfully"],
  ["dsu_drift_targets", "DSU Drift Targets loaded successfully"],
  ["dsu_daa_eee", "DSU DAA EEE loaded successfully"],
  ["dsu_ic_taa", "DSU IC TAA loaded successfully"],
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Anchor on a fixed Tuesday so the dataset is stable across renders.
const ANCHOR = "2026-06-09";
const BUSINESS_DAYS = 20;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const freshnessFor = (s: Status): Freshness =>
  s === "f" ? "Stale" : s === "c" ? "Cached" : "Current";

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Stable 8-char hex id derived from a seed. */
function hexId(seed: number): string {
  const n = Math.abs(Math.sin(seed) * 1e9) | 0;
  return n.toString(16).padStart(8, "0").slice(0, 8);
}

/** Most recent N weekdays from the anchor, newest first. */
function recentBusinessDays(): { date: string; dow: string; tag: string }[] {
  const out: { date: string; dow: string; tag: string }[] = [];
  const d = new Date(`${ANCHOR}T00:00:00`);
  while (out.length < BUSINESS_DAYS) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) {
      const tag = out.length === 0 ? "Today" : out.length === 1 ? "Yesterday" : "";
      out.push({ date: isoDate(d), dow: DOW[wd], tag });
    }
    d.setDate(d.getDate() - 1);
  }
  return out;
}

// Lite refreshes only the source-data subset of the full template.
const LITE_TEMPLATE = ASSET_TEMPLATE.filter(([name]) => LITE_ASSET_KEYS.includes(name));

function buildAssets(template: ReadonlyArray<[string, string]>): Asset[] {
  return template.map(([key, message]) => ({
    name: displayAsset(key),
    message,
    status: "s",
    freshness: "Current",
  }));
}

/** Seed a few realistic non-success states on the Full pipeline for variety. */
function applyFullScenario(assets: Asset[], dayIndex: number, windowIndex: number): void {
  if (dayIndex === 0 && windowIndex === 3) {
    assets.forEach((a, i) => i >= 2 && (a.status = "c"));
    assets[9].message =
      "IDM Policy Tree served from cache (upstream: idm/pivoted_policy_trees, run id: f315298f)";
  } else if (dayIndex === 1 && windowIndex === 5) {
    assets[1].status = "f";
    assets[1].message = "Aladdin position feed timed out (retry 3/3)";
    assets[6].status = "f";
    assets[6].message = "Skipped — upstream Aladdin positions failed";
  } else if (dayIndex === 2 && windowIndex === 2) {
    assets.forEach((a) => (a.status = "c"));
  } else if (dayIndex === 3 && windowIndex === 4) {
    assets[9].status = "c";
  } else if (dayIndex === 4 && windowIndex === 6) {
    assets[7].status = "f";
    assets[7].message = "Darkstar / Bloomberg pricing feed delayed past cut-off";
    assets[9].status = "c";
  } else if (dayIndex >= 5) {
    const h = dayIndex * 31 + windowIndex * 7;
    if (h % 5 === 0) assets[h % assets.length].status = "c";
  }
}

/** And a couple on the Lite pipeline. liteIndex is the run's order within the day. */
function applyLiteScenario(assets: Asset[], dayIndex: number, liteIndex: number): void {
  if (dayIndex === 0 && liteIndex === 3) {
    assets.forEach((a) => (a.status = "c"));
  } else if (dayIndex === 1 && liteIndex === 6) {
    assets[1].status = "f";
    assets[1].message = "Aladdin position feed timed out";
  } else if (dayIndex >= 5) {
    const h = dayIndex * 17 + liteIndex * 5;
    if (h % 7 === 0) assets[h % assets.length].status = "c";
  }
}

function buildRun(
  opts: {
    seed: number;
    pipeline: Run["pipeline"];
    runNo?: number;
    window: string;
    windowKey: string;
    time: string;
    date: string;
    template: ReadonlyArray<[string, string]>;
    scenario: (assets: Asset[]) => void;
  },
): Run {
  const assets = buildAssets(opts.template);
  opts.scenario(assets);
  for (const a of assets) a.freshness = freshnessFor(a.status);
  return {
    id: hexId(opts.seed),
    pipeline: opts.pipeline,
    runNo: opts.runNo,
    window: opts.window,
    windowKey: opts.windowKey,
    time: opts.time,
    date: opts.date,
    status: rollUp(assets.map((a) => a.status)),
    assets,
  };
}

function buildDay(
  meta: { date: string; dow: string; tag: string },
  dayIndex: number,
  nowMinutes: number,
): Day {
  const d = new Date(`${meta.date}T00:00:00`);

  const fullRuns = RUN_WINDOWS.map((w, windowIndex) =>
    buildRun({
      seed: dayIndex * 100000 + toMinutes(w.time) * 10,
      pipeline: "full",
      runNo: w.no,
      window: w.name,
      windowKey: w.key,
      time: w.time,
      date: meta.date,
      template: ASSET_TEMPLATE,
      scenario: (assets) => applyFullScenario(assets, dayIndex, windowIndex),
    }),
  );

  const liteRuns: Run[] = [];
  let liteIndex = 0;
  for (const lw of LITE_WINDOWS) {
    for (const time of lw.times) {
      const index = liteIndex++;
      liteRuns.push(
        buildRun({
          seed: dayIndex * 100000 + toMinutes(time) * 10 + 1,
          pipeline: "lite",
          window: `${lw.name} refresh`,
          windowKey: lw.key,
          time,
          date: meta.date,
          template: LITE_TEMPLATE,
          scenario: (assets) => applyLiteScenario(assets, dayIndex, index),
        }),
      );
    }
  }

  let runs = [...fullRuns, ...liteRuns].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  // Today only reflects runs that have already executed; future runs aren't
  // present yet (mirrors what the delta table / API would return mid-day).
  if (dayIndex === 0) runs = runs.filter((r) => toMinutes(r.time) <= nowMinutes);

  return {
    ...meta,
    weekday: WEEKDAYS[d.getDay()],
    dateLabel: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    runs,
  };
}

/** The mock dataset: recent business days, newest first. */
export function getMockDays(): Day[] {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return recentBusinessDays().map((meta, i) => buildDay(meta, i, nowMinutes));
}
