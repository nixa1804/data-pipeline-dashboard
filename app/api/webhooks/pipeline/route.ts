import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { runId, status, durationMs, rowsProcessed, errorMessage } = body;

  if (!runId || !status) {
    return NextResponse.json({ error: "Missing runId or status" }, { status: 400 });
  }

  await prisma.pipelineRun.update({
    where: { id: runId },
    data: {
      status,
      finishedAt: new Date(),
      durationMs: durationMs ?? null,
      rowsProcessed: rowsProcessed ?? null,
      errorMessage: errorMessage ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
