import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/db";
import clsx from "clsx";
import type { AlertSeverity, AlertStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_TABS: { label: string; value: AlertStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Resolved", value: "resolved" },
];

const severityIcon = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityStyle: Record<AlertSeverity, string> = {
  critical: "text-red-400 bg-red-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  info: "text-sky-400 bg-sky-500/10",
};

const statusPill: Record<AlertStatus, string> = {
  active: "bg-red-500/10 text-red-400",
  acknowledged: "bg-amber-500/10 text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
};

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const alerts = await prisma.alert.findMany({
    where: status ? { status } : undefined,
    include: { pipeline: { select: { name: true } } },
    orderBy: { triggeredAt: "desc" },
  });

  const activeCount = await prisma.alert.count({ where: { status: "active" } });
  const totalCount = await prisma.alert.count();

  return (
    <>
      <Header
        title="Alerts"
        subtitle={`${activeCount} open · ${totalCount} total`}
      />
      <main className="flex-1 px-6 py-6 space-y-4 max-w-3xl">
        <div className="flex gap-1">
          {STATUS_TABS.map(({ label, value }) => {
            const isActive = status === value || (!status && !value);
            return (
              <Link
                key={label}
                href={value ? `/alerts?status=${value}` : "/alerts"}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl divide-y divide-white/5">
          {alerts.length === 0 && (
            <p className="px-5 py-10 text-sm text-zinc-500 text-center">
              No alerts found.
            </p>
          )}
          {alerts.map((alert) => {
            const severity = alert.severity as AlertSeverity;
            const alertStatus = alert.status as AlertStatus;
            const Icon = severityIcon[severity];
            return (
              <div key={alert.id} className="px-5 py-4 flex items-start gap-3">
                <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${severityStyle[severity]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {alert.pipeline?.name && (
                      <span className="text-xs font-medium text-zinc-400">
                        {alert.pipeline.name}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium",
                        statusPill[alertStatus]
                      )}
                    >
                      {alertStatus}
                    </span>
                    <span className="text-xs text-zinc-600 ml-auto">
                      {formatDistanceToNow(alert.triggeredAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                  {alert.resolvedAt && (
                    <p className="text-xs text-emerald-500/70 mt-1">
                      Resolved {formatDistanceToNow(alert.resolvedAt, { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
