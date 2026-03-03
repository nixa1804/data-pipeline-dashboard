"use client";

import dynamic from "next/dynamic";

const LatencyChart = dynamic(() => import("@/components/dashboard/LatencyChart"), {
  loading: () => (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[300px] animate-pulse" />
  ),
  ssr: false,
});

const RunVolumeChart = dynamic(() => import("@/components/dashboard/RunVolumeChart"), {
  loading: () => (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[300px] animate-pulse" />
  ),
  ssr: false,
});

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

interface ChartsClientProps {
  latencyTrend: LatencyPoint[];
  runVolume: VolumePoint[];
}

export default function ChartsClient({ latencyTrend, runVolume }: ChartsClientProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <LatencyChart data={latencyTrend} />
      <RunVolumeChart data={runVolume} />
    </div>
  );
}
