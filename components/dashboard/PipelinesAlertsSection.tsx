import PipelineCard from "@/components/dashboard/PipelineCard";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { prisma } from "@/lib/db";
import type { Pipeline, Alert } from "@/types";

export default async function PipelinesAlertsSection() {
  const [dbPipelines, allRuns, dbAlerts] = await Promise.all([
    prisma.pipeline.findMany({
      include: { runs: { orderBy: { startedAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pipelineRun.findMany({
      select: { pipelineId: true, status: true, durationMs: true },
      orderBy: { startedAt: "desc" },
      take: 500,
    }),
    prisma.alert.findMany({
      include: { pipeline: { select: { name: true } } },
      orderBy: { triggeredAt: "desc" },
    }),
  ]);

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
      itemUnit: p.itemUnit,
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

  return (
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
  );
}
