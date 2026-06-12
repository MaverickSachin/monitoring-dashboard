import { RunsDashboard } from "@/components/dashboard/RunsDashboard";
import { getPipelineDays } from "@/lib/pipeline/data-source";

// Always render fresh on (re)visit and on the in-app Refresh button, so each
// load/refresh re-runs the server fetch and picks up the latest run output.
export const dynamic = "force-dynamic";

export default async function Page() {
  const days = await getPipelineDays();

  return (
    <main className="wrap">
      <RunsDashboard days={days} />
    </main>
  );
}
