import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const run = await prisma.pipelineRun.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      durationMs: true,
      rowsProcessed: true,
      errorMessage: true,
      finishedAt: true,
    },
  });

  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}
