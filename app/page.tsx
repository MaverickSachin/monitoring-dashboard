import { AutoRefresh } from "@/components/AutoRefresh";
import { RunsDashboard } from "@/components/dashboard/RunsDashboard";
import { getPipelineDays } from "@/lib/pipeline/data-source";

// Always render fresh on (re)visit so scheduled refreshes pick up new run output.
export const dynamic = "force-dynamic";

export default async function Page() {
  const days = await getPipelineDays();

  return (
    <main className="wrap">
      <AutoRefresh />
      <RunsDashboard days={days} />
    </main>
  );
}
