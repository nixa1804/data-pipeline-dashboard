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
