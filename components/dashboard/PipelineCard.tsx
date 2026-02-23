import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, Rows3 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import RetryButton from "@/components/dashboard/RetryButton";
import type { Pipeline, RunStatus } from "@/types";

function formatMs(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${(ms / 60000).toFixed(1)} min`;
}

function statusVariant(s: RunStatus) {
  return s as "success" | "failed" | "running" | "skipped";
}

interface PipelineCardProps {
  pipeline: Pipeline;
}

export default function PipelineCard({ pipeline }: PipelineCardProps) {
  const run = pipeline.lastRun;

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 flex flex-col gap-4 hover:border-white/10 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{pipeline.name}</p>
          {pipeline.description && (
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{pipeline.description}</p>
          )}
        </div>
        {run && (
          <Badge
            variant={statusVariant(run.status)}
            label={run.status.charAt(0).toUpperCase() + run.status.slice(1)}
            dot
          />
        )}
      </div>

      {/* Source → Destination */}
      {(pipeline.source || pipeline.destination) && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {pipeline.source && (
            <span className="bg-white/5 rounded px-2 py-0.5 font-mono truncate max-w-[45%]">
              {pipeline.source}
            </span>
          )}
          {pipeline.source && pipeline.destination && (
            <ArrowRight className="w-3 h-3 shrink-0" />
          )}
          {pipeline.destination && (
            <span className="bg-white/5 rounded px-2 py-0.5 font-mono truncate max-w-[45%]">
              {pipeline.destination}
            </span>
          )}
        </div>
      )}

      {/* Last run stats */}
      {run && (
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {run.durationMs != null ? formatMs(run.durationMs) : "—"}
          </span>
          <span className="flex items-center gap-1">
            <Rows3 className="w-3 h-3" />
            {run.rowsProcessed != null
              ? run.rowsProcessed.toLocaleString() + " " + (pipeline.itemUnit ?? "items")
              : "—"}
          </span>
          <span className="ml-auto">
            {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            Success rate:{" "}
            {pipeline.successRate != null ? (
              <span
                className={
                  pipeline.successRate < 90
                    ? "text-red-400"
                    : pipeline.successRate < 95
                    ? "text-amber-400"
                    : "text-emerald-400"
                }
              >
                {pipeline.successRate.toFixed(1)}%
              </span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </span>
        </div>
        <Link
          href={`/pipelines/${pipeline.id}`}
          className="text-xs text-zinc-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          Details
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Error snippet */}
      {run?.errorMessage && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2 flex items-start justify-between gap-3">
          <p className="text-xs text-red-400 font-mono line-clamp-2">{run.errorMessage}</p>
          <RetryButton pipelineId={pipeline.id} className="shrink-0 mt-0.5" />
        </div>
      )}
    </div>
  );
}
