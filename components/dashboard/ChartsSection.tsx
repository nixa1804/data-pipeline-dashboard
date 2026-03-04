import DashboardChartsClient from "@/components/dashboard/DashboardChartsClient";
import { prisma } from "@/lib/db";
import { subDays, subHours } from "date-fns";

export default async function ChartsSection() {
  const now = new Date();
  const since24h = subHours(now, 24);
  const since7d = subDays(now, 7);

  const runs7d = await prisma.pipelineRun.findMany({
    where: { startedAt: { gte: since7d } },
    select: { startedAt: true, status: true, durationMs: true },
  });

  const latencyRuns = runs7d.filter(
    (r) => r.startedAt >= since24h && r.durationMs != null
  );
  const latencyTrend = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now);
    hour.setMinutes(0, 0, 0);
    hour.setHours(hour.getHours() - (23 - i));
    const nextHour = new Date(hour);
    nextHour.setHours(nextHour.getHours() + 1);
    const hourRuns = latencyRuns.filter(
      (r) => r.startedAt >= hour && r.startedAt < nextHour
    );
    const avg =
      hourRuns.length > 0
        ? Math.round(
            hourRuns.reduce((a, b) => a + (b.durationMs ?? 0), 0) /
              hourRuns.length
          )
        : 0;
    const sorted = hourRuns.map((r) => r.durationMs ?? 0).sort((a, b) => a - b);
    const p95 =
      sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
    return {
      hour: `${String(hour.getHours()).padStart(2, "0")}:00`,
      latencyMs: avg,
      p95Ms: p95,
    };
  });

  const runVolume = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayRuns = runs7d.filter(
      (r) => r.startedAt >= day && r.startedAt < nextDay
    );
    return {
      date: day.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      success: dayRuns.filter((r) => r.status === "success").length,
      failed: dayRuns.filter((r) => r.status === "failed").length,
      skipped: dayRuns.filter((r) => r.status === "skipped").length,
    };
  });

  return (
    <DashboardChartsClient latencyTrend={latencyTrend} runVolume={runVolume} />
  );
}
