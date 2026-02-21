import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { prisma } from "@/lib/db";
import type { RunStatus, Alert } from "@/types";
import clsx from "clsx";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    select: { name: true, description: true },
  });
  if (!pipeline) return { title: "Pipeline not found" };
  return {
    title: pipeline.name,
    description: pipeline.description ?? undefined,
  };
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  return `${(ms / 60_000).toFixed(1)} min`;
}

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: {
      runs: { orderBy: { startedAt: "desc" }, take: 50 },
      alerts: { orderBy: { triggeredAt: "desc" } },
    },
  });

  if (!pipeline) notFound();

  const finished = pipeline.runs.filter(
    (r) => r.status !== "running" && r.status !== "skipped"
  );
  const succeeded = finished.filter((r) => r.status === "success");
  const successRate =
    finished.length > 0
      ? Math.round((succeeded.length / finished.length) * 1000) / 10
      : null;
  const durations = pipeline.runs
    .filter((r) => r.durationMs != null)
    .map((r) => r.durationMs as number);
  const avgDurationMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;
  const lastRun = pipeline.runs[0] ?? null;

  const alerts: Alert[] = pipeline.alerts.map((a) => ({
    id: a.id,
    pipelineId: a.pipelineId,
    pipelineName: pipeline.name,
    severity: a.severity as Alert["severity"],
    message: a.message,
    status: a.status as Alert["status"],
    triggeredAt: a.triggeredAt.toISOString(),
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
  }));

  return (
    <>
      <Header
        title={pipeline.name}
        subtitle={`${pipeline.source} → ${pipeline.destination}`}
      />
      <main className="flex-1 px-6 py-6 space-y-6">
        <Link
          href="/pipelines"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          All pipelines
        </Link>

        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 flex flex-wrap gap-6 items-start">
          <div className="flex items-center gap-3">
            <Badge
              variant={pipeline.status as "active" | "inactive"}
              label={pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
              dot
            />
          </div>
          {pipeline.description && (
            <p className="text-sm text-zinc-400 flex-1">{pipeline.description}</p>
          )}
          <div className="flex items-center gap-5 text-xs text-zinc-500 ml-auto">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {pipeline.schedule}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatDistanceToNow(pipeline.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#161b22] border border-white/5 rounded-xl px-5 py-3">
          <span className="bg-white/5 rounded px-2 py-1 font-mono">{pipeline.source}</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="bg-white/5 rounded px-2 py-1 font-mono">{pipeline.destination}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Runs", value: pipeline.runs.length },
            {
              label: "Success Rate",
              value: successRate != null ? `${successRate}%` : "—",
              color:
                successRate == null
                  ? "text-white"
                  : successRate >= 95
                  ? "text-emerald-400"
                  : successRate >= 90
                  ? "text-amber-400"
                  : "text-red-400",
            },
            {
              label: "Avg Duration",
              value: avgDurationMs != null ? formatMs(avgDurationMs) : "—",
            },
            {
              label: "Last Run",
              value: lastRun
                ? formatDistanceToNow(lastRun.startedAt, { addSuffix: true })
                : "Never",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[#161b22] border border-white/5 rounded-xl p-5"
            >
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                {label}
              </p>
              <p className={clsx("text-2xl font-bold mt-1 tabular-nums", color ?? "text-white")}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Run History</h2>
            <span className="text-xs text-zinc-500">Last {pipeline.runs.length} runs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Started</th>
                  <th className="px-5 py-3 text-left font-medium">Finished</th>
                  <th className="px-5 py-3 text-right font-medium">Duration</th>
                  <th className="px-5 py-3 text-right font-medium">Rows</th>
                  <th className="px-5 py-3 text-left font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pipeline.runs.map((run) => (
                  <tr key={run.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <Badge
                        variant={run.status as RunStatus}
                        label={run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        dot
                      />
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      <span title={format(run.startedAt, "PPpp")}>
                        {formatDistanceToNow(run.startedAt, { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {run.finishedAt ? (
                        <span title={format(run.finishedAt, "PPpp")}>
                          {formatDistanceToNow(run.finishedAt, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-zinc-400 tabular-nums">
                      {run.durationMs != null ? formatMs(run.durationMs) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-zinc-400 tabular-nums">
                      {run.rowsProcessed != null
                        ? run.rowsProcessed.toLocaleString()
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      {run.errorMessage ? (
                        <span className="text-red-400 font-mono truncate block" title={run.errorMessage}>
                          {run.errorMessage}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="max-w-lg">
            <AlertsPanel alerts={alerts} />
          </div>
        )}
      </main>
    </>
  );
}
