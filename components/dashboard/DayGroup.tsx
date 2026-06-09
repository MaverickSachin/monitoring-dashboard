import { countRuns, type Day, type Run } from "@/lib/pipeline";
import { RunRow } from "./RunRow";

interface DayGroupProps {
  day: Day;
  runs: Run[]; // possibly a search-filtered subset of day.runs
  collapsed: boolean;
  onToggleDay: () => void;
  isRunOpen: (run: Run) => boolean;
  onToggleRun: (run: Run) => void;
}

/** A collapsible day header followed by its run rows. */
export function DayGroup({
  day,
  runs,
  collapsed,
  onToggleDay,
  isRunOpen,
  onToggleRun,
}: DayGroupProps) {
  const c = countRuns(day);
  const total = day.runs.length;

  return (
    <>
      <tr
        className={`dayrow${collapsed ? "" : " open"}`}
        onClick={onToggleDay}
        aria-expanded={!collapsed}
      >
        <td colSpan={6}>
          <div className="dlabel">
            <span className="dcar" aria-hidden="true">
              ▸
            </span>
            <span className="dwhen">
              <span className="dwd">
                <b>{day.weekday}</b>, {day.dateLabel}
              </span>
              {day.tag && <span className="dtag">{day.tag}</span>}
            </span>
            <span className="dcount">
              {runs.length === total ? total : `${runs.length}/${total}`} runs · {c.s} ✓
              {c.c ? ` · ${c.c} cached` : ""}
              {c.f ? ` · ${c.f} failed` : ""}
            </span>
          </div>
        </td>
      </tr>
      {!collapsed && (
        <>
          <tr className="colhead">
            <th scope="col" className="runh">
              Run
            </th>
            <th scope="col">Pipeline</th>
            <th scope="col">Scheduled</th>
            <th scope="col" className="assets">Assets</th>
            <th scope="col" className="c">
              Status
            </th>
            <th scope="col">Run summary</th>
          </tr>
          {[...runs]
            .sort((a, b) => b.time.localeCompare(a.time))
            .map((run) => (
              <RunRow
                key={run.id}
                run={run}
                isOpen={isRunOpen(run)}
                onToggle={() => onToggleRun(run)}
              />
            ))}
        </>
      )}
    </>
  );
}
