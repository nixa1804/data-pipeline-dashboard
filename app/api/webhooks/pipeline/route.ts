import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { runId, jobId, status, startedAt, durationMs, rowsProcessed, itemsProcessed, errorMessage } = body;

  if (!status) {
    return NextResponse.json({ error: "Missing required field: status" }, { status: 400 });
  }

  const items = itemsProcessed ?? rowsProcessed ?? null;
  const finishedAt = new Date();

  if (runId) {
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status,
        finishedAt,
        durationMs: durationMs ?? null,
        rowsProcessed: items,
        errorMessage: errorMessage ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (jobId) {
    const job = await prisma.pipeline.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    const start = startedAt ? new Date(startedAt) : new Date(finishedAt.getTime() - (durationMs ?? 0));
    const run = await prisma.pipelineRun.create({
      data: {
        pipelineId: jobId,
        status,
        startedAt: start,
        finishedAt,
        durationMs: durationMs ?? (finishedAt.getTime() - start.getTime()),
        rowsProcessed: items,
        errorMessage: errorMessage ?? null,
      },
    });
    return NextResponse.json({ ok: true, runId: run.id });
  }

  return NextResponse.json({ error: "Provide either runId or jobId" }, { status: 400 });
}
