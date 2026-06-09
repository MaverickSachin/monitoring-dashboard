import { Dot } from "@/components/ui/Dot";
import { runSummary, STATUS_LABEL, type Day, type Run, type Status } from "@/lib/pipeline";

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

/**
 * Latest data state. Headlines the single most recent run; if that run wasn't
 * successful, also surfaces the last successful run so users know what good
 * data they can still rely on.
 */
export function HealthBanner({ day, onPickRun }: HealthBannerProps) {
  const lastRun = latestBy(day.runs, () => true);
  const lastSuccess =
    lastRun && lastRun.status !== "s"
      ? latestBy(day.runs, (r) => r.status === "s")
      : undefined;
  const overall: Status = lastRun?.status ?? "s";

  return (
    <div className="banner card">
      <div className="big">
        <Dot status={overall} size={22} />
        <span className="bword">{VERDICT[overall]}</span>
      </div>
      <div className="latest">
        {lastRun && (
          <LatestCard
            label="Last run"
            run={lastRun}
            detail={runSummary(lastRun)}
            onPick={onPickRun}
          />
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
  detail,
  onPick,
}: {
  label: string;
  run: Run;
  detail?: string;
  onPick: (run: Run) => void;
}) {
  return (
    <button
      type="button"
      className={`lcard${detail ? " wide" : ""}`}
      onClick={() => onPick(run)}
      title={`${label}: ${run.time} — ${STATUS_LABEL[run.status]}`}
    >
      <span className="lc-label">{label}</span>
      <span className="lc-row">
        <Dot status={run.status} size={14} />
        <span className="lc-time">{run.time}</span>
        <span className="lc-status">{STATUS_LABEL[run.status]}</span>
      </span>
      {detail && <span className="lc-detail">{detail}</span>}
    </button>
  );
}
