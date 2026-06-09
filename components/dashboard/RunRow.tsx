import { Dot } from "@/components/ui/Dot";
import { assetBreakdown, runSummary, STATUS_LABEL, type Run } from "@/lib/pipeline";
import { AssetDetailTable } from "./AssetDetailTable";

interface RunRowProps {
  run: Run;
  isOpen: boolean;
  onToggle: () => void;
}

/** A single run row plus its expandable asset detail. */
export function RunRow({ run, isOpen, onToggle }: RunRowProps) {
  return (
    <>
      <tr className={`run${isOpen ? " open" : ""}`} onClick={onToggle} aria-expanded={isOpen}>
        <td>
          <span className="rid">
            <span className="car" aria-hidden="true">
              ▸
            </span>
            <span className="rinfo">
              <span className="rtop">
                <span className="rno">Run {run.runNo}</span>
                {run.window}
              </span>
              <span className="rsub">
                {run.id} · {run.assets.length} assets
              </span>
            </span>
          </span>
        </td>
        <td className="time">{run.time}</td>
        <td>
          <span className="note">{assetBreakdown(run)}</span>
        </td>
        <td className="c">
          <Dot status={run.status} size={16} title={STATUS_LABEL[run.status]} />
        </td>
        <td>
          <span className="note">{runSummary(run)}</span>
        </td>
      </tr>
      {isOpen && (
        <tr className="detail">
          <td colSpan={5}>
            <AssetDetailTable assets={run.assets} />
          </td>
        </tr>
      )}
    </>
  );
}
