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
    /** REST API base URL (the Flask service), e.g. https://pipeline-api.internal. */
    baseUrl: process.env.PIPELINE_API_BASE_URL ?? "",
    /** Endpoint path returning the audit payload, e.g. "/audit_data". */
    runsPath: process.env.PIPELINE_API_RUNS_PATH ?? "/audit_data",
    /** Bearer token / API key for the service (optional). */
    token: process.env.PIPELINE_API_TOKEN ?? "",
    /** Gateway identity headers (service account / app identifiers). */
    userId: process.env.PIPELINE_API_USER_ID ?? "",
    appName: process.env.PIPELINE_API_APP_NAME ?? "",
    appPath: process.env.PIPELINE_API_APP_PATH ?? "",
    /** How many recent business days to request. */
    days: Number(process.env.PIPELINE_API_DAYS ?? "20"),
  },
} as const;
