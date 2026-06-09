"use client";

import { useEffect } from "react";

/**
 * Route error boundary. Catches failures from the page's server fetch (e.g. the
 * pipeline API is unreachable) and replaces the whole view — so no stale run
 * data is shown — with a friendly "contact the team" message. The raw error is
 * logged for devs but never rendered.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pipeline dashboard failed to load data:", error);
  }, [error]);

  return (
    <main className="wrap errpage">
      <div className="errcard card">
        <div className="err-link" aria-hidden="true">
          <span className="err-node">UI</span>
          <span className="err-dash" />
          <span className="err-break">✕</span>
          <span className="err-dash" />
          <span className="err-node off">API</span>
        </div>

        <h1 className="err-title">Can’t reach the pipeline API</h1>
        <p className="err-body">
          The dashboard couldn’t load run data right now — the monitoring API isn’t
          responding. This one’s on us, not you.
        </p>
        <p className="err-action">
          Please contact the <b>Platform / Dev team</b> so they can take a look.
        </p>

        <div className="err-code">
          ERR · PIPELINE_API_UNREACHABLE
          <span className="err-cursor" aria-hidden="true">
            ▋
          </span>
        </div>
        {error.digest && <p className="err-ref">reference: {error.digest}</p>}

        <div className="err-buttons">
          <button type="button" className="pbtn" onClick={reset}>
            ↻ Try again
          </button>
        </div>
      </div>
    </main>
  );
}
