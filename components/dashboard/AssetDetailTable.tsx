import { Dot } from "@/components/ui/Dot";
import { STATUS_LABEL, type Asset } from "@/lib/pipeline";

interface AssetDetailTableProps {
  assets: Asset[];
}

/** The per-asset breakdown shown when a run row is expanded. */
export function AssetDetailTable({ assets }: AssetDetailTableProps) {
  return (
    <div className="sub-inner">
      <div className="ahead">
        <span />
        <span>Asset</span>
        <span>Data Freshness</span>
        <span>Data Status Message</span>
      </div>
      {assets.map((a) => (
        <div className="arow" key={a.name}>
          <Dot status={a.status} size={13} title={STATUS_LABEL[a.status]} />
          <span className="an">{a.name}</span>
          <span className={`afresh f-${a.status}`}>{a.freshness}</span>
          <span className="anote">{a.message}</span>
        </div>
      ))}
    </div>
  );
}
