import { Suspense } from "react";
import {
  GitBranch,
  CheckCircle,
  XCircle,
  Bell,
  Activity,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import ChartsSection from "@/components/dashboard/ChartsSection";
import PipelinesAlertsSection from "@/components/dashboard/PipelinesAlertsSection";
import { prisma } from "@/lib/db";
import { subDays, subHours } from "date-fns";

export const revalidate = 30;

export default async function DashboardPage() {
  const now = new Date();
  const since24h = subHours(now, 24);
  const since7d = subDays(now, 7);

  const [
    totalPipelines,
    activePipelines,
    failedRuns24h,
    runs7dFinished,
    latencyAgg,
    activeAlerts,
  ] = await Promise.all([
    prisma.pipeline.count(),
    prisma.pipeline.count({ where: { status: "active" } }),
    prisma.pipelineRun.count({
      where: { startedAt: { gte: since24h }, status: "failed" },
    }),
    prisma.pipelineRun.findMany({
      where: {
        startedAt: { gte: since7d },
        status: { notIn: ["running", "skipped"] },
      },
      select: { status: true },
    }),
    prisma.pipelineRun.aggregate({
      _avg: { durationMs: true },
      where: { status: "success" },
    }),
    prisma.alert.count({ where: { status: "active" } }),
  ]);

  const success7d = runs7dFinished.filter((r) => r.status === "success").length;
  const successRate7d =
    runs7dFinished.length > 0
      ? Math.round((success7d / runs7dFinished.length) * 1000) / 10
      : 100;
  const avgLatencyMs = Math.round(latencyAgg._avg.durationMs ?? 0);

  const stats = {
    totalPipelines,
    activePipelines,
    failedRuns24h,
    successRate7d,
    avgLatencyMs,
    activeAlerts,
  };

  return (
    <>
      <Header title="Dashboard" subtitle="ETL pipeline health at a glance" />
      <main className="flex-1 px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            label="Total Pipelines"
            value={stats.totalPipelines}
            icon={GitBranch}
            highlight="default"
          />
          <StatsCard
            label="Active"
            value={stats.activePipelines}
            icon={CheckCircle}
            highlight="emerald"
          />
          <StatsCard
            label="Failed (24 h)"
            value={stats.failedRuns24h}
            icon={XCircle}
            highlight={stats.failedRuns24h > 0 ? "red" : "emerald"}
          />
          <StatsCard
            label="Success Rate"
            value={`${stats.successRate7d}%`}
            sub="last 7 days"
            icon={TrendingUp}
            highlight={stats.successRate7d >= 95 ? "emerald" : "amber"}
          />
          <StatsCard
            label="Avg Latency"
            value={`${(stats.avgLatencyMs / 1000).toFixed(1)} s`}
            sub="across all runs"
            icon={Activity}
            highlight="blue"
          />
          <StatsCard
            label="Open Alerts"
            value={stats.activeAlerts}
            icon={Bell}
            highlight={stats.activeAlerts > 0 ? "red" : "emerald"}
          />
        </div>

        <Suspense fallback={<ChartsSkeleton />}>
          <ChartsSection />
        </Suspense>

        <Suspense fallback={<PipelinesAlertsSkeleton />}>
          <PipelinesAlertsSection />
        </Suspense>
      </main>
    </>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[300px] animate-pulse" />
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[300px] animate-pulse" />
    </div>
  );
}

function PipelinesAlertsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[160px] animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 h-[320px] animate-pulse" />
    </div>
  );
}
