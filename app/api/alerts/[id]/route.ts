import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-api-key");
  if (process.env.JOB_API_SECRET && secret !== process.env.JOB_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const validStatuses = ["active", "acknowledged", "resolved"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "status must be: active, acknowledged, or resolved" }, { status: 400 });
  }

  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "resolved" ? new Date() : alert.resolvedAt,
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
