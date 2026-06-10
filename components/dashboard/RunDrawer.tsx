"use client";

import { useEffect } from "react";
import { Dot } from "@/components/ui/Dot";
import { assetBreakdown, STATUS_LABEL, STATUS_PHRASE, type Run } from "@/lib/pipeline";

interface RunDrawerProps {
  run: Run | null;
  onClose: () => void;
}

/** Slide-in detail panel listing every asset materialized by a run. */
export function RunDrawer({ run, onClose }: RunDrawerProps) {
  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, onClose]);

  return (
    <>
      <div className={`scrim${run ? " open" : ""}`} onClick={onClose} />
      <aside
        className={`drawer${run ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!run}
        aria-label={run ? `Run ${run.id} details` : undefined}
      >
        {run && (
          <>
            <div className="dh">
              <button className="x" onClick={onClose} aria-label="Close">
                ✕
              </button>
              <div className="did">
                {run.runNo != null ? `Run ${run.runNo} · ${run.window}` : run.window}
              </div>
              <div className="dmeta">
                {run.date} · {run.time}
                <span>·</span>
                <Dot status={run.status} size={13} title={STATUS_LABEL[run.status]} />
                {STATUS_PHRASE[run.status]}
              </div>
              <div className="dmeta2">
                {run.id} — {run.assets.length} assets · {assetBreakdown(run)}
              </div>
            </div>
            <div className="dbody">
              {run.assets.map((a) => (
                <div className="darow" key={a.name}>
                  <Dot status={a.status} size={14} title={STATUS_LABEL[a.status]} />
                  <div>
                    <div className="an">
                      {a.name}
                      <span className="res">{a.resource}</span>
                    </div>
                    <div className={`ameta f-${a.status}`}>Data freshness · {a.freshness}</div>
                    <div className="anote">{a.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
