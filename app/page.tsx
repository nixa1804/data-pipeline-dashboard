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
import { prisma } from "@/lib/db";
import { subDays, subHours } from "date-fns";
import type { Pipeline, Alert } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const since24h = subHours(now, 24);
  const since7d = subDays(now, 7);

  const [dbPipelines, allRuns, runs7d, dbAlerts] = await Promise.all([
    prisma.pipeline.findMany({
      include: { runs: { orderBy: { startedAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pipelineRun.findMany({
      select: { pipelineId: true, status: true, durationMs: true },
    }),
    prisma.pipelineRun.findMany({
      where: { startedAt: { gte: since7d } },
      select: { startedAt: true, status: true, durationMs: true },
    }),
    prisma.alert.findMany({
      include: { pipeline: { select: { name: true } } },
      orderBy: { triggeredAt: "desc" },
    }),
  ]);

  const failedRuns24h = runs7d.filter(
    (r) => r.startedAt >= since24h && r.status === "failed"
  ).length;

  const runs7dFinished = runs7d.filter(
    (r) => r.status !== "running" && r.status !== "skipped"
  );
  const success7d = runs7dFinished.filter((r) => r.status === "success").length;
  const successRate7d =
    runs7dFinished.length > 0
      ? Math.round((success7d / runs7dFinished.length) * 1000) / 10
      : 100;

  const successfulRuns = allRuns.filter(
    (r) => r.status === "success" && r.durationMs != null
  );
  const avgLatencyMs =
    successfulRuns.length > 0
      ? Math.round(
          successfulRuns.reduce((a, b) => a + (b.durationMs ?? 0), 0) /
            successfulRuns.length
        )
      : 0;

  const activeAlerts = dbAlerts.filter((a) => a.status === "active").length;

  const runsByPipeline = new Map<string, typeof allRuns>();
  for (const run of allRuns) {
    if (!runsByPipeline.has(run.pipelineId))
      runsByPipeline.set(run.pipelineId, []);
    runsByPipeline.get(run.pipelineId)!.push(run);
  }

  const pipelines: Pipeline[] = dbPipelines.map((p) => {
    const runs = runsByPipeline.get(p.id) ?? [];
    const finished = runs.filter(
      (r) => r.status !== "running" && r.status !== "skipped"
    );
    const succeeded = finished.filter((r) => r.status === "success");
    const successRate =
      finished.length > 0
        ? Math.round((succeeded.length / finished.length) * 1000) / 10
        : null;
    const durations = runs
      .filter((r) => r.durationMs != null)
      .map((r) => r.durationMs as number);
    const avgDurationMs =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    const lastRun = p.runs[0] ?? null;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status as Pipeline["status"],
      schedule: p.schedule,
      source: p.source,
      destination: p.destination,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      successRate: successRate ?? undefined,
      avgDurationMs: avgDurationMs ?? undefined,
      lastRun: lastRun
        ? {
            id: lastRun.id,
            pipelineId: lastRun.pipelineId,
            status: lastRun.status as any,
            startedAt: lastRun.startedAt.toISOString(),
            finishedAt: lastRun.finishedAt?.toISOString() ?? null,
            durationMs: lastRun.durationMs,
            rowsProcessed: lastRun.rowsProcessed,
            errorMessage: lastRun.errorMessage,
            createdAt: lastRun.createdAt.toISOString(),
          }
        : null,
    };
  });

  const alerts: Alert[] = dbAlerts.map((a) => ({
    id: a.id,
    pipelineId: a.pipelineId,
    pipelineName: a.pipeline?.name ?? null,
    severity: a.severity as Alert["severity"],
    message: a.message,
    status: a.status as Alert["status"],
    triggeredAt: a.triggeredAt.toISOString(),
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
  }));

  const stats = {
    totalPipelines: dbPipelines.length,
    activePipelines: dbPipelines.filter((p) => p.status === "active").length,
    failedRuns24h,
    successRate7d,
    avgLatencyMs,
    activeAlerts,
  };

  const latencyRuns = runs7d.filter(
    (r) => r.startedAt >= since24h && r.durationMs != null
  );
  const latencyTrend = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now);
    hour.setMinutes(0, 0, 0);
    hour.setHours(hour.getHours() - (23 - i));
    const nextHour = new Date(hour);
    nextHour.setHours(nextHour.getHours() + 1);
    const hourRuns = latencyRuns.filter(
      (r) => r.startedAt >= hour && r.startedAt < nextHour
    );
    const avg =
      hourRuns.length > 0
        ? Math.round(
            hourRuns.reduce((a, b) => a + (b.durationMs ?? 0), 0) /
              hourRuns.length
          )
        : 0;
    const sorted = hourRuns.map((r) => r.durationMs ?? 0).sort((a, b) => a - b);
    const p95 =
      sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
    return {
      hour: `${String(hour.getHours()).padStart(2, "0")}:00`,
      latencyMs: avg,
      p95Ms: p95,
    };
  });

  const runVolume = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayRuns = runs7d.filter(
      (r) => r.startedAt >= day && r.startedAt < nextDay
    );
    return {
      date: day.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      success: dayRuns.filter((r) => r.status === "success").length,
      failed: dayRuns.filter((r) => r.status === "failed").length,
      skipped: dayRuns.filter((r) => r.status === "skipped").length,
    };
  });

  return (
    <>
      <Header title="Dashboard" subtitle="ETL pipeline health at a glance" />
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
          <LatencyChart data={latencyTrend} />
          <RunVolumeChart data={runVolume} />
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
