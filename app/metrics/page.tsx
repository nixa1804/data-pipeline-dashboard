import Header from "@/components/layout/Header";
import LatencyChart from "@/components/dashboard/LatencyChart";
import RunVolumeChart from "@/components/dashboard/RunVolumeChart";
import { mockLatencyTrend, mockRunVolume } from "@/lib/mock-data";

export default function MetricsPage() {
  return (
    <>
      <Header title="Metrics" subtitle="Historical pipeline performance" />
      <main className="flex-1 px-6 py-6 space-y-4">
        <LatencyChart data={mockLatencyTrend} />
        <RunVolumeChart data={mockRunVolume} />
      </main>
    </>
  );
}
