import Header from "@/components/layout/Header";
import LatencyChart from "@/components/dashboard/LatencyChart";
import RunVolumeChart from "@/components/dashboard/RunVolumeChart";
import { prisma } from "@/lib/db";
import { subDays, subHours } from "date-fns";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const now = new Date();
  const since24h = subHours(now, 24);
  const since7d = subDays(now, 7);

  const latencyRuns = await prisma.pipelineRun.findMany({
    where: { startedAt: { gte: since24h }, durationMs: { not: null } },
    select: { startedAt: true, durationMs: true },
  });

  const latencyTrend = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now);
    hour.setMinutes(0, 0, 0);
    hour.setHours(hour.getHours() - (23 - i));
    const nextHour = new Date(hour);
    nextHour.setHours(nextHour.getHours() + 1);
    const runs = latencyRuns.filter(
      (r) => r.startedAt >= hour && r.startedAt < nextHour
    );
    const avg =
      runs.length > 0
        ? Math.round(
            runs.reduce((a, b) => a + (b.durationMs ?? 0), 0) / runs.length
          )
        : 0;
    const sorted = runs.map((r) => r.durationMs ?? 0).sort((a, b) => a - b);
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
    return {
      hour: `${String(hour.getHours()).padStart(2, "0")}:00`,
      latencyMs: avg,
      p95Ms: p95,
    };
  });

  const volumeRuns = await prisma.pipelineRun.findMany({
    where: { startedAt: { gte: since7d } },
    select: { startedAt: true, status: true },
  });

  const runVolume = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayRuns = volumeRuns.filter(
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

  const totalRuns = await prisma.pipelineRun.count({
    where: { startedAt: { gte: since7d } },
  });
  const failedRuns = await prisma.pipelineRun.count({
    where: { startedAt: { gte: since7d }, status: "failed" },
  });
  const successRate =
    totalRuns > 0
      ? Math.round(((totalRuns - failedRuns) / totalRuns) * 1000) / 10
      : 100;

  return (
    <>
      <Header title="Metrics" subtitle="Historical pipeline performance" />
      <main className="flex-1 px-6 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Runs (7d)", value: totalRuns },
            { label: "Failed Runs (7d)", value: failedRuns, red: failedRuns > 0 },
            {
              label: "Success Rate (7d)",
              value: `${successRate}%`,
              color:
                successRate >= 95
                  ? "text-emerald-400"
                  : successRate >= 90
                  ? "text-amber-400"
                  : "text-red-400",
            },
          ].map(({ label, value, color, red }) => (
            <div
              key={label}
              className="bg-[#161b22] border border-white/5 rounded-xl p-5"
            >
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                {label}
              </p>
              <p
                className={`text-2xl font-bold mt-1 tabular-nums ${
                  color ?? (red ? "text-red-400" : "text-white")
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <LatencyChart data={latencyTrend} />
        <RunVolumeChart data={runVolume} />
      </main>
    </>
  );
}
