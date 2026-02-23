import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-key");
  if (process.env.JOB_API_SECRET && secret !== process.env.JOB_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, status, schedule, source, destination, itemUnit } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
  }

  const job = await prisma.pipeline.create({
    data: {
      name,
      description: description ?? null,
      status: status ?? "active",
      schedule: schedule ?? null,
      source: source ?? null,
      destination: destination ?? null,
      itemUnit: itemUnit ?? null,
    },
  });

  return NextResponse.json({ id: job.id, name: job.name }, { status: 201 });
}
