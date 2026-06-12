import { useEffect, useMemo, useState } from "react";
import { PIPELINE_LABEL, runKey, type Day, type Run } from "@/lib/pipeline";

const DAYS_PER_PAGE = 5;

export interface VisibleDay {
  day: Day;
  runs: Run[];
}

const matches = (run: Run, q: string) =>
  run.id.toLowerCase().includes(q) ||
  run.window.toLowerCase().includes(q) ||
  PIPELINE_LABEL[run.pipeline].toLowerCase().includes(q) ||
  run.assets.some(
    (a) => a.name.toLowerCase().includes(q) || a.message.toLowerCase().includes(q),
  );

/**
 * View-model for the runs table: paging, search, expand/collapse, and drawer
 * selection. Keeps {@link RunsDashboard} purely presentational.
 */
export function useRunsTable(days: Day[]) {
  const [page, setPage] = useState(0);
  const [openRuns, setOpenRuns] = useState<ReadonlySet<string>>(new Set());
  const [collapsedDays, setCollapsedDays] = useState<ReadonlySet<string>>(
    () => new Set(days.slice(1).map((d) => d.date)), // all but today
  );
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Searching spans every day (no paging); otherwise show one page of days.
  const visibleDays = useMemo<VisibleDay[]>(() => {
    if (searching) {
      return days
        .map((day) => ({ day, runs: day.runs.filter((r) => matches(r, q)) }))
        .filter((v) => v.runs.length > 0);
    }
    const start = page * DAYS_PER_PAGE;
    return days.slice(start, start + DAYS_PER_PAGE).map((day) => ({ day, runs: day.runs }));
  }, [days, searching, q, page]);

  const matchCount = useMemo(
    () => (searching ? days.reduce((n, d) => n + d.runs.filter((r) => matches(r, q)).length, 0) : 0),
    [days, searching, q],
  );

  // Keep the top day of the current page expanded so columns stay anchored.
  useEffect(() => {
    if (searching) return;
    const topDate = days[page * DAYS_PER_PAGE]?.date;
    if (!topDate) return;
    setCollapsedDays((prev) => {
      if (!prev.has(topDate)) return prev;
      const next = new Set(prev);
      next.delete(topDate);
      return next;
    });
  }, [days, page, searching]);

  const toggleIn = (set: ReadonlySet<string>, key: string): ReadonlySet<string> => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  };

  const totalDays = days.length;
  const pages = Math.max(1, Math.ceil(totalDays / DAYS_PER_PAGE));

  return {
    visibleDays,
    searching,
    query,
    setQuery,
    matchCount,
    page,
    setPage,
    pageInfo: {
      pages,
      from: page * DAYS_PER_PAGE + 1,
      to: Math.min((page + 1) * DAYS_PER_PAGE, totalDays),
      total: totalDays,
    },
    isRunOpen: (run: Run) => openRuns.has(runKey(run)),
    toggleRun: (run: Run) => setOpenRuns((prev) => toggleIn(prev, runKey(run))),
    isDayCollapsed: (day: Day) => !searching && collapsedDays.has(day.date),
    toggleDay: (day: Day) => setCollapsedDays((prev) => toggleIn(prev, day.date)),
    selectedRun,
    openRun: setSelectedRun,
    closeRun: () => setSelectedRun(null),
  };
}
