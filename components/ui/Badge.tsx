import clsx from "clsx";

type Variant = "success" | "failed" | "running" | "skipped" | "warning" | "info" | "critical" | "active" | "inactive";

const variantStyles: Record<Variant, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  failed: "bg-red-500/15 text-red-400 border border-red-500/20",
  running: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  skipped: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  info: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
  critical: "bg-red-500/15 text-red-400 border border-red-500/20",
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  inactive: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
};

interface BadgeProps {
  variant: Variant;
  label: string;
  dot?: boolean;
  className?: string;
}

export default function Badge({ variant, label, dot = false, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full", {
            "bg-emerald-400 animate-pulse": variant === "running",
            "bg-emerald-400": variant === "success" || variant === "active",
            "bg-red-400": variant === "failed" || variant === "critical",
            "bg-amber-400": variant === "warning",
            "bg-sky-400": variant === "info",
            "bg-zinc-400": variant === "skipped" || variant === "inactive",
          })}
        />
      )}
      {label}
    </span>
  );
}
