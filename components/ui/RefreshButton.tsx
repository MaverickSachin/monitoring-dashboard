"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Manual data refresh — the only way the dashboard re-pulls data (no polling,
 * no background timers). Clicking re-runs the server fetch (the
 * `pipeline_run_audit_summary` API or mock) via `router.refresh()` and streams
 * the latest records in while preserving the user's open/search state. Wrapping
 * the call in a transition keeps `isPending` true for the whole round-trip, so
 * the button can show a live "Refreshing…" state. The backend call and token
 * stay server-side.
 */
export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <span className="tipwrap" data-tip="Click to load the latest pipeline data">
      <button
        type="button"
        className="refreshbtn"
        onClick={refresh}
        disabled={isPending}
        aria-label="Refresh — load the latest pipeline data"
        aria-busy={isPending}
      >
        <span className={`ric${isPending ? " spin" : ""}`} aria-hidden="true">
          ↻
        </span>
        <span className="rlabel">{isPending ? "Refreshing…" : "Refresh"}</span>
      </button>
    </span>
  );
}
