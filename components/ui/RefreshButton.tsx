"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "ffma-dse-react-ui";

/**
 * Manual data refresh — the only way the dashboard re-pulls data (no polling,
 * no background timers). Clicking re-runs the server fetch (the
 * `pipeline_run_audit_summary` API or mock) via `router.refresh()` and streams
 * the latest records in while preserving the user's open/search state. Wrapping
 * the call in a transition keeps `isPending` true for the whole round-trip, so
 * the button can show a live "Refreshing…" state. The backend call and token
 * stay server-side.
 *
 * The button itself is the shared FFMA `Button` from `ffma-dse-react-ui`; the
 * tooltip wrapper stays local since the library doesn't provide one.
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
      <Button
        type="button"
        variant="primary"
        size="medium"
        onClick={refresh}
        loading={isPending}
        disabled={isPending}
        aria-label="Refresh — load the latest pipeline data"
        aria-busy={isPending}
      >
        {isPending ? "Refreshing…" : "Refresh"}
      </Button>
    </span>
  );
}
