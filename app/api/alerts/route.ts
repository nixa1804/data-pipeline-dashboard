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

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-key");
  if (process.env.JOB_API_SECRET && secret !== process.env.JOB_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { jobId, severity, message } = body;

  if (!severity || !message) {
    return NextResponse.json({ error: "Missing required fields: severity, message" }, { status: 400 });
  }

  const validSeverities = ["critical", "warning", "info"];
  if (!validSeverities.includes(severity)) {
    return NextResponse.json({ error: "severity must be: critical, warning, or info" }, { status: 400 });
  }

  if (jobId) {
    const job = await prisma.pipeline.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
  }

  const alert = await prisma.alert.create({
    data: {
      pipelineId: jobId ?? null,
      severity,
      message,
      status: "active",
    },
  });

  return NextResponse.json({ id: alert.id }, { status: 201 });
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

  const alerts = await prisma.alert.findMany({
    include: { pipeline: { select: { name: true } } },
    orderBy: { triggeredAt: "desc" },
  });

  const result = alerts.map((a) => ({
    id: a.id,
    pipelineId: a.pipelineId,
    pipelineName: a.pipeline?.name ?? null,
    severity: a.severity,
    message: a.message,
    status: a.status,
    triggeredAt: a.triggeredAt.toISOString(),
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
  }));

  return NextResponse.json(result, {
    headers: { "X-RateLimit-Remaining": String(remaining) },
  });
}
