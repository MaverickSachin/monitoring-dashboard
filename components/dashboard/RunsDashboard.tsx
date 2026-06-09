"use client";

import { useRunsTable } from "@/hooks/useRunsTable";
import { Dot } from "@/components/ui/Dot";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Day } from "@/lib/pipeline";
import { HealthBanner } from "./HealthBanner";
import { Pager } from "./Pager";
import { RunDrawer } from "./RunDrawer";
import { RunsTable } from "./RunsTable";
import { SearchBar } from "./SearchBar";

interface RunsDashboardProps {
  days: Day[];
}

/** Top-level dashboard: health banner, searchable runs table, and detail drawer. */
export function RunsDashboard({ days }: RunsDashboardProps) {
  const table = useRunsTable(days);

  return (
    <div>
      <header className="topbar">
        <div>
          <h1 className="title">
            Listed Equities <span className="u">Rebalancing</span>
          </h1>
          <p className="sub">Dagster Pipeline · Monitoring Dashboard · 7 Runs / Weekday</p>
        </div>
        <div className="topright">
          <div className="legend">
            <span className="item">
              <Dot status="s" /> Success
            </span>
            <span className="item">
              <Dot status="c" /> Cached
            </span>
            <span className="item">
              <Dot status="f" /> Failure
            </span>
            <span className="item">
              <Dot status="p" /> Pending
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {days.length > 0 && <HealthBanner day={days[0]} onPickRun={table.openRun} />}

      <div className="runhead">
        <h2 className="rhtitle">Pipeline runs</h2>
        <SearchBar query={table.query} onChange={table.setQuery} />
      </div>

      <RunsTable
        days={table.visibleDays}
        query={table.query}
        isDayCollapsed={table.isDayCollapsed}
        onToggleDay={table.toggleDay}
        isRunOpen={table.isRunOpen}
        onToggleRun={table.toggleRun}
      />

      {table.searching ? (
        <div className="pager">
          <span className="pinfo">
            <b>{table.matchCount}</b> {table.matchCount === 1 ? "run" : "runs"} match “
            {table.query}”
          </span>
        </div>
      ) : (
        <Pager {...table.pageInfo} page={table.page} unit="days" onChange={table.setPage} />
      )}

      <RunDrawer run={table.selectedRun} onClose={table.closeRun} />
    </div>
  );
}
