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
import PipelineCard from "@/components/dashboard/PipelineCard";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import LatencyChart from "@/components/dashboard/LatencyChart";
import RunVolumeChart from "@/components/dashboard/RunVolumeChart";
import {
  mockPipelines,
  mockAlerts,
  mockStats,
  mockLatencyTrend,
  mockRunVolume,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const stats = mockStats;
  const pipelines = mockPipelines;
  const alerts = mockAlerts;

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="ETL pipeline health at a glance"
      />
      <main className="flex-1 px-6 py-6 space-y-6">
        {/* Stats row */}
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

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <LatencyChart data={mockLatencyTrend} />
          <RunVolumeChart data={mockRunVolume} />
        </div>

        {/* Pipelines + Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Pipelines</h2>
              <span className="text-xs text-zinc-500">
                {pipelines.filter((p) => p.status === "active").length} active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pipelines.map((pipeline) => (
                <PipelineCard key={pipeline.id} pipeline={pipeline} />
              ))}
            </div>
          </div>

          <div>
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </main>
    </>
  );
}
