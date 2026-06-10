import "server-only";

import { env } from "@/lib/env";
import { ApiPipelineDataSource } from "./api-client";
import { getMockDays } from "./mock-data";
import type { Day, PipelineDataSource } from "./types";

/** Mock implementation — deterministic local/dev data. */
class MockPipelineDataSource implements PipelineDataSource {
  async getDays(): Promise<Day[]> {
    return getMockDays();
  }
}

let cached: PipelineDataSource | undefined;

/** Resolve the active data source from configuration (memoized). */
export function getPipelineDataSource(): PipelineDataSource {
  if (cached) return cached;
  cached =
    env.dataSource === "api"
      ? new ApiPipelineDataSource(env.api)
      : new MockPipelineDataSource();
  return cached;
}

/** Convenience entry point for server components. */
export function getPipelineDays(): Promise<Day[]> {
  return getPipelineDataSource().getDays();
}
