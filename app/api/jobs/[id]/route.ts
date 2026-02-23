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
  const { name, description, status, schedule, source, destination, itemUnit } = body;

  const validStatuses = ["active", "inactive", "deprecated"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "status must be: active, inactive, or deprecated" }, { status: 400 });
  }

  const job = await prisma.pipeline.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updated = await prisma.pipeline.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(schedule !== undefined && { schedule }),
      ...(source !== undefined && { source }),
      ...(destination !== undefined && { destination }),
      ...(itemUnit !== undefined && { itemUnit }),
    },
  });

  return NextResponse.json({ id: updated.id, name: updated.name, status: updated.status });
}
