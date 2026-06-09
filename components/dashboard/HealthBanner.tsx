import { Dot } from "@/components/ui/Dot";
import {
  countByStatus,
  rollUp,
  runSummary,
  STATUS_LABEL,
  type Day,
  type Run,
  type Status,
} from "@/lib/pipeline";

interface HealthBannerProps {
  day: Day;
  onPickRun: (run: Run) => void;
}

const VERDICT: Record<Status, string> = {
  s: "All Clear",
  c: "All Caught Up",
  f: "Needs Attention",
};

/** Most recent run (across both pipelines) matching a predicate, by time. */
function latestBy(runs: Run[], match: (run: Run) => boolean): Run | undefined {
  let latest: Run | undefined;
  for (const r of runs) {
    if (match(r) && (!latest || r.time > latest.time)) latest = r;
  }
  return latest;
}

/** One-line tally of the day's runs so far: surfaces any failures / cached runs. */
function daySummary(day: Day): string {
  const total = day.runs.length;
  if (total === 0) return "no runs yet today";
  const c = countByStatus(day.runs);
  const parts: string[] = [];
  if (c.f) parts.push(`${c.f} failed`);
  if (c.c) parts.push(`${c.c} cached`);
  return parts.length
    ? `${parts.join(" · ")} of ${total} runs today`
    : `all ${total} runs successful today`;
}

/**
 * "Today at a glance": a day-level verdict (worst-wins, so failures aren't
 * hidden by a later success), plus the latest run and the latest successful run.
 */
export function HealthBanner({ day, onPickRun }: HealthBannerProps) {
  const overall: Status = rollUp(day.runs.map((r) => r.status));
  const lastRun = latestBy(day.runs, () => true);
  const lastSuccess = latestBy(day.runs, (r) => r.status === "s");

  return (
    <div className="banner card">
      <div className="glance">
        <span className="glance-label">Today at a glance</span>
        <div className="big">
          <Dot status={overall} size={22} />
          <span className="bword">{VERDICT[overall]}</span>
        </div>
        <span className="glance-sub">{daySummary(day)}</span>
      </div>
      <div className="latest">
        {lastRun && (
          <LatestCard label="Last run" run={lastRun} onPick={onPickRun} />
        )}
        {lastSuccess && (
          <LatestCard label="Last successful run" run={lastSuccess} onPick={onPickRun} />
        )}
      </div>
    </div>
  );
}

function LatestCard({
  label,
  run,
  onPick,
}: {
  label: string;
  run: Run;
  onPick: (run: Run) => void;
}) {
  return (
    <button
      type="button"
      className="lcard"
      onClick={() => onPick(run)}
      title={`${label}: ${run.time} — ${STATUS_LABEL[run.status]}`}
    >
      <span className="lc-label">{label}</span>
      <span className="lc-row">
        <Dot status={run.status} size={14} />
        <span className="lc-time">{run.time}</span>
        <span className="lc-status">{STATUS_LABEL[run.status]}</span>
      </span>
      <span className="lc-detail">{runSummary(run)}</span>
    </button>
  );
}
