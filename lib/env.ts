import "server-only";

/**
 * Server-only environment access. The `server-only` import makes the build fail
 * if this module is ever pulled into a client bundle, keeping tokens off the
 * wire. Never prefix these with NEXT_PUBLIC_.
 */
function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const env = {
  /** Which data source backs the dashboard: "mock" (default) or "api". */
  dataSource: oneOf(process.env.PIPELINE_DATA_SOURCE, ["mock", "api"] as const, "mock"),
  api: {
    /** FastAPI base URL, e.g. https://pipeline-api.internal. */
    baseUrl: process.env.PIPELINE_API_BASE_URL ?? "",
    /** Bearer token / API key for the FastAPI service. */
    token: process.env.PIPELINE_API_TOKEN ?? "",
    /** How many recent business days to request. */
    days: Number(process.env.PIPELINE_API_DAYS ?? "20"),
  },
} as const;
