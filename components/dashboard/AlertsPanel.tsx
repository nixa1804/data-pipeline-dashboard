import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import type { Alert, AlertSeverity } from "@/types";

const severityIcon = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityStyle = {
  critical: "text-red-400 bg-red-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  info: "text-sky-400 bg-sky-500/10",
};

const statusPill = {
  active: "bg-red-500/10 text-red-400",
  acknowledged: "bg-amber-500/10 text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
};

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const active = alerts.filter((a) => a.status !== "resolved");

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white">Active Alerts</h2>
        {active.length > 0 && (
          <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
            {active.length} open
          </span>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {active.length === 0 && (
          <p className="px-5 py-8 text-sm text-zinc-500 text-center">No active alerts</p>
        )}
        {active.map((alert) => {
          const Icon = severityIcon[alert.severity as AlertSeverity];
          return (
            <div key={alert.id} className="px-5 py-3.5 flex items-start gap-3">
              <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${severityStyle[alert.severity as AlertSeverity]}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {alert.pipelineName && (
                    <span className="text-xs font-medium text-zinc-400">{alert.pipelineName}</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusPill[alert.status]}`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{alert.message}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
