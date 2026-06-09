import "server-only";

import { rollUp } from "./selectors";
import type { Asset, Day, Freshness, PipelineDataSource, Run, Status } from "./types";

/**
 * REST-API data source — backend-agnostic (works with the existing Flask API,
 * or any HTTP service). This is the ONE place the real backend is wired; the UI
 * depends only on the {@link PipelineDataSource} interface. Activate it with
 * `PIPELINE_DATA_SOURCE=api` (see lib/env.ts and docs/API_INTEGRATION.md).
 *
 * Integration checklist:
 *   1. Point PIPELINE_API_BASE_URL at the Flask service (+ PIPELINE_API_RUNS_PATH
 *      if the endpoint isn't `/runs`).
 *   2. Confirm the DTO shape below matches the response; adjust the DTO types and
 *      the `toDay`/`toRun`/`toAsset` mappers if it differs.
 *   3. Set PIPELINE_API_TOKEN and keep it server-side only.
 */

// --- Wire format (DTOs) --------------------------------------------------
// Mirror exactly what the API returns. Kept separate from the domain types so a
// backend change is absorbed by the mappers, not the whole app.

interface AssetDTO {
  name: string;
  resource: string;
  status: string; // "success" | "cached" | "failure"
  freshness: string; // "Current" | "Cached" | "Stale"
  message: string;
}

interface RunDTO {
  id: string;
  pipeline: string; // "full" | "lite" — tagged by the backend via schedule match
  run_no?: number; // present for full runs only
  window: string;
  window_key: string;
  scheduled_time: string; // "09:00"
  date: string; // "2026-06-09"
  assets: AssetDTO[];
}

interface DayDTO {
  date: string;
  runs: RunDTO[];
}

// --- Mappers (DTO -> domain) --------------------------------------------

const STATUS_FROM_API: Record<string, Status> = {
  success: "s",
  cached: "c",
  failure: "f",
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toAsset = (dto: AssetDTO): Asset => ({
  name: dto.name,
  resource: dto.resource,
  status: STATUS_FROM_API[dto.status] ?? "f",
  freshness: (dto.freshness as Freshness) ?? "Stale",
  message: dto.message,
});

function toRun(dto: RunDTO): Run {
  const assets = dto.assets.map(toAsset);
  return {
    id: dto.id,
    pipeline: dto.pipeline === "lite" ? "lite" : "full",
    runNo: dto.run_no,
    window: dto.window,
    windowKey: dto.window_key,
    time: dto.scheduled_time,
    date: dto.date,
    status: rollUp(assets.map((a) => a.status)),
    assets,
  };
}

function toDay(dto: DayDTO, index: number): Day {
  const d = new Date(`${dto.date}T00:00:00`);
  return {
    date: dto.date,
    dow: DOW[d.getDay()],
    weekday: WEEKDAYS[d.getDay()],
    dateLabel: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    tag: index === 0 ? "Today" : index === 1 ? "Yesterday" : "",
    runs: dto.runs.map(toRun),
  };
}

// --- Data source ---------------------------------------------------------

export class ApiPipelineDataSource implements PipelineDataSource {
  constructor(
    private readonly baseUrl: string,
    private readonly runsPath: string,
    private readonly token: string,
    private readonly days: number,
  ) {
    if (!baseUrl) {
      throw new Error("PIPELINE_API_BASE_URL is required when PIPELINE_DATA_SOURCE=api");
    }
  }

  async getDays(): Promise<Day[]> {
    const url = `${this.baseUrl}${this.runsPath}?days=${this.days}`;
    // `no-store` so each scheduled UI refresh pulls the latest run output rather
    // than a cached copy (refresh cadence is driven by AutoRefresh).
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Pipeline API responded ${res.status} ${res.statusText}`);
    }

    const payload = (await res.json()) as DayDTO[];
    return payload.map(toDay);
  }
}
