import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(req: NextRequest) {
  const { success, remaining, resetAt } = rateLimit(getIp(req));

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const pipelines = await prisma.pipeline.findMany({
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const pipelineIds = pipelines.map((p) => p.id);
  const allRuns = await prisma.pipelineRun.findMany({
    where: { pipelineId: { in: pipelineIds } },
    select: { pipelineId: true, status: true, durationMs: true },
  });

  const runsByPipeline = new Map<string, typeof allRuns>();
  for (const run of allRuns) {
    if (!runsByPipeline.has(run.pipelineId)) {
      runsByPipeline.set(run.pipelineId, []);
    }
    runsByPipeline.get(run.pipelineId)!.push(run);
  }

  const result = pipelines.map((p) => {
    const runs = runsByPipeline.get(p.id) ?? [];
    const finished = runs.filter((r) => r.status !== "running" && r.status !== "skipped");
    const succeeded = finished.filter((r) => r.status === "success");
    const successRate =
      finished.length > 0
        ? Math.round((succeeded.length / finished.length) * 1000) / 10
        : null;
    const durationsMs = runs
      .filter((r) => r.durationMs != null)
      .map((r) => r.durationMs as number);
    const avgDurationMs =
      durationsMs.length > 0
        ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length)
        : null;

    const lastRun = p.runs[0] ?? null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      schedule: p.schedule,
      source: p.source,
      destination: p.destination,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      successRate,
      avgDurationMs,
      lastRun: lastRun
        ? {
            id: lastRun.id,
            pipelineId: lastRun.pipelineId,
            status: lastRun.status,
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

  return NextResponse.json(result, {
    headers: { "X-RateLimit-Remaining": String(remaining) },
  });
}
