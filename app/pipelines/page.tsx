import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Pipelines",
  description: "View and monitor all ETL pipelines, their status, success rates and last run details.",
};
import PipelineCard from "@/components/dashboard/PipelineCard";
import { prisma } from "@/lib/db";
import clsx from "clsx";
import type { Pipeline } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Deprecated", value: "deprecated" },
];

export default async function PipelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const dbPipelines = await prisma.pipeline.findMany({
    where: status ? { status } : undefined,
    include: { runs: { orderBy: { startedAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "asc" },
  });

  const allRuns = await prisma.pipelineRun.findMany({
    where: { pipelineId: { in: dbPipelines.map((p) => p.id) } },
    select: { pipelineId: true, status: true, durationMs: true },
  });

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

  const totalCount = await prisma.pipeline.count();

  return (
    <>
      <Header
        title="Pipelines"
        subtitle={`${pipelines.length}${status ? ` ${status}` : ""} of ${totalCount} total`}
      />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex gap-1">
          {STATUS_TABS.map(({ label, value }) => {
            const isActive = status === value || (!status && !value);
            return (
              <Link
                key={label}
                href={value ? `/pipelines?status=${value}` : "/pipelines"}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {pipelines.length === 0 ? (
          <div className="bg-[#161b22] border border-white/5 rounded-xl px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">No pipelines found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pipelines.map((pipeline) => (
              <PipelineCard key={pipeline.id} pipeline={pipeline} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
