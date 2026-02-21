import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
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

  return NextResponse.json(result);
}
