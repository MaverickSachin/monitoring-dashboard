import "server-only";

/**
 * Server-only environment access. The `server-only` import makes the build fail
 * if this module is ever pulled into a client bundle, keeping tokens off the
 * wire. Never prefix these with NEXT_PUBLIC_.
 */
const str = (value: string | undefined): string => (value ?? "").trim();

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  const v = str(value) as T; // trim so a stray space ("api ") doesn't fall back to mock
  return allowed.includes(v) ? v : fallback;
}

export const env = {
  /** Which data source backs the dashboard: "mock" (default) or "api". */
  dataSource: oneOf(process.env.PIPELINE_DATA_SOURCE, ["mock", "api"] as const, "mock"),
  api: {
    /** REST API base URL (the Flask service), e.g. https://pipeline-api.internal. */
    baseUrl: str(process.env.PIPELINE_API_BASE_URL),
    /** Endpoint path returning the run-audit summary, e.g. "/pipeline_run_audit_summary". */
    runsPath: str(process.env.PIPELINE_API_RUNS_PATH) || "/pipeline_run_audit_summary",
    /** Bearer token / API key for the service (optional). */
    token: str(process.env.PIPELINE_API_TOKEN),
    /** Gateway identity headers (service account / app identifiers). */
    userId: str(process.env.PIPELINE_API_USER_ID),
    appName: str(process.env.PIPELINE_API_APP_NAME),
    appPath: str(process.env.PIPELINE_API_APP_PATH),
    /** How many recent business days to request. */
    days: Number(str(process.env.PIPELINE_API_DAYS) || "20"),
  },
} as const;

// One-time startup log (server console) so the resolved source is visible.
if (process.env.NODE_ENV !== "production") {
  const where = env.dataSource === "api" ? ` → ${env.api.baseUrl}${env.api.runsPath}` : "";
  console.log(`[pipeline] data source = ${env.dataSource}${where}`);
}
