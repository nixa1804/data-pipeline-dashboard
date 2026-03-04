"use client";

import dynamic from "next/dynamic";

const LatencyChartSVG = dynamic(
  () => import("@/components/dashboard/LatencyChartSVG"),
  {
    loading: () => (
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[300px] animate-pulse" />
    ),
    ssr: false,
  }
);

const RunVolumeChartSVG = dynamic(
  () => import("@/components/dashboard/RunVolumeChartSVG"),
  {
    loading: () => (
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[300px] animate-pulse" />
    ),
    ssr: false,
  }
);

interface LatencyPoint {
  hour: string;
  latencyMs: number;
  p95Ms: number;
}

interface VolumePoint {
  date: string;
  success: number;
  failed: number;
  skipped: number;
}

interface DashboardChartsClientProps {
  latencyTrend: LatencyPoint[];
  runVolume: VolumePoint[];
}

export default function DashboardChartsClient({
  latencyTrend,
  runVolume,
}: DashboardChartsClientProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <LatencyChartSVG data={latencyTrend} />
      <RunVolumeChartSVG data={runVolume} />
    </div>
  );
}
