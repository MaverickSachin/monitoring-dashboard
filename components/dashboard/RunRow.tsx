import { Dot } from "@/components/ui/Dot";
import {
  assetBreakdown,
  PIPELINE_LABEL,
  runSummary,
  STATUS_LABEL,
  type Run,
} from "@/lib/pipeline";
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
                {run.pipeline === "full" ? (
                  <>
                    <span className="rno">Run {run.runNo}</span>
                    {run.window}
                  </>
                ) : (
                  `${run.window} refresh`
                )}
              </span>
              <span className="rsub">
                {run.id} · {run.assets.length} assets
              </span>
            </span>
          </span>
        </td>
        <td>
          <span className={`pchip ${run.pipeline}`}>{PIPELINE_LABEL[run.pipeline]}</span>
        </td>
        <td className="time">{run.time}</td>
        <td className="assets">
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
          <td colSpan={6}>
            <AssetDetailTable assets={run.assets} />
          </td>
        </tr>
      )}
    </>
  );
}
