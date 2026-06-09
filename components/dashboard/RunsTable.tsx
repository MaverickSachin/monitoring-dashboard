import type { Run } from "@/lib/pipeline";
import { DayGroup } from "./DayGroup";
import type { VisibleDay } from "@/hooks/useRunsTable";

interface RunsTableProps {
  days: VisibleDay[];
  query: string;
  isDayCollapsed: (day: VisibleDay["day"]) => boolean;
  onToggleDay: (day: VisibleDay["day"]) => void;
  isRunOpen: (run: Run) => boolean;
  onToggleRun: (run: Run) => void;
}

/** The day-grouped runs table with fixed columns. */
export function RunsTable({
  days,
  query,
  isDayCollapsed,
  onToggleDay,
  isRunOpen,
  onToggleRun,
}: RunsTableProps) {
  return (
    <div className="card tablewrap">
      <table className="tbl">
        <colgroup>
          <col style={{ width: "32%" }} />
          <col style={{ width: "92px" }} />
          <col style={{ width: "170px" }} />
          <col style={{ width: "92px" }} />
          <col />
        </colgroup>
        <tbody>
          {days.length === 0 ? (
            <tr>
              <td className="empty" colSpan={5}>
                No runs match “{query}”.
              </td>
            </tr>
          ) : (
            days.map(({ day, runs }) => (
              <DayGroup
                key={day.date}
                day={day}
                runs={runs}
                collapsed={isDayCollapsed(day)}
                onToggleDay={() => onToggleDay(day)}
                isRunOpen={isRunOpen}
                onToggleRun={onToggleRun}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
