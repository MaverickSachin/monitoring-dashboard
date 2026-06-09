import { Dot } from "@/components/ui/Dot";
import {
  countRuns,
  healthWord,
  overallStatus,
  STATUS_LABEL,
  type Day,
  type Run,
} from "@/lib/pipeline";

interface HealthBannerProps {
  day: Day;
  onPickRun: (run: Run) => void;
}

/** "Health at a glance" summary for the latest day + its 7 scheduled run dots. */
export function HealthBanner({ day, onPickRun }: HealthBannerProps) {
  const c = countRuns(day);
  const total = day.runs.length;
  const done = c.s + c.c + c.f;

  return (
    <div className="banner card">
      <div className="big">
        <Dot status={overallStatus(c)} size={22} />
        <span className="bwrap">
          <span className="bword">{healthWord(c)}</span>
          {c.p > 0 && (
            <span className="bprog">
              {done} / {total} runs complete
            </span>
          )}
        </span>
      </div>
      <div className="pills">
        <span className="pill ok">{c.s} Success</span>
        <span className="pill warn">{c.c} Cached</span>
        <span className="pill bad">{c.f} Failed</span>
        {c.p > 0 && <span className="pill pend">{c.p} Pending</span>}
      </div>
      <div className="runs7">
        {day.runs.map((run) => (
          <button
            type="button"
            className="r"
            key={run.id}
            onClick={() => onPickRun(run)}
            title={`Run ${run.runNo} · ${run.window} · ${run.time} — ${STATUS_LABEL[run.status]}`}
          >
            <Dot status={run.status} size={18} />
            <span className="t">{run.time}</span>
            <span className="w">{run.window}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
