"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { msUntilNextRefresh } from "@/lib/pipeline/refresh-schedule";

/**
 * Re-pulls pipeline data on a schedule-aware cadence: it waits until just after
 * each run is expected to finish, then calls `router.refresh()` — which re-runs
 * the server fetch (Flask API or mock) and streams fresh data in while keeping
 * the user's open/search state. The backend call and token stay server-side.
 */
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      timer = setTimeout(() => {
        if (!active) return;
        router.refresh();
        tick(); // re-arm for the next expected output
      }, msUntilNextRefresh(new Date()));
    };

    tick();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}
