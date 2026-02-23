import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-key");
  if (process.env.JOB_API_SECRET && secret !== process.env.JOB_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { jobId } = body;

  if (!jobId) {
    return NextResponse.json({ error: "Missing required field: jobId" }, { status: 400 });
  }

  const job = await prisma.pipeline.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const run = await prisma.pipelineRun.create({
    data: {
      pipelineId: jobId,
      status: "running",
      startedAt: new Date(),
    },
  });

  return NextResponse.json({ runId: run.id }, { status: 201 });
}
