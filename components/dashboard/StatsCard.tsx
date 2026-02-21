import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  highlight?: "red" | "emerald" | "amber" | "blue" | "default";
}

const highlightStyles = {
  red: "text-red-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  blue: "text-blue-400",
  default: "text-white",
};

const iconBg = {
  red: "bg-red-500/10 text-red-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
  blue: "bg-blue-500/10 text-blue-400",
  default: "bg-white/5 text-zinc-400",
};

export default function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight = "default",
}: StatsCardProps) {
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 flex items-start gap-4">
      <div className={clsx("p-2 rounded-lg", iconBg[highlight])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
        <p className={clsx("text-2xl font-bold mt-1 tabular-nums", highlightStyles[highlight])}>
          {value}
        </p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
