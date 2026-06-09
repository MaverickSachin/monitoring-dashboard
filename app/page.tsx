import { RunsDashboard } from "@/components/dashboard/RunsDashboard";
import { getPipelineDays } from "@/lib/pipeline/data-source";

export default async function Page() {
  const days = await getPipelineDays();

  return (
    <main className="wrap">
      <RunsDashboard days={days} />
    </main>
  );
}
