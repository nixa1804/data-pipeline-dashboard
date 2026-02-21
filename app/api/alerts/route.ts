import { NextResponse } from "next/server";
import { mockAlerts } from "@/lib/mock-data";

export async function GET() {
  // TODO: replace with real DB query via prisma once Docker DB is running
  return NextResponse.json(mockAlerts);
}
