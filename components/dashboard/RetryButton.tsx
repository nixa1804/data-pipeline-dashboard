"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { startPipelineRun } from "@/app/actions/retry-pipeline";

interface RetryButtonProps {
  pipelineId: string;
  className?: string;
}

export default function RetryButton({ pipelineId, className }: RetryButtonProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleRetry() {
    setIsRunning(true);
    try {
      const runId = await startPipelineRun(pipelineId);
      intervalRef.current = setInterval(async () => {
        const res = await fetch(`/api/runs/${runId}`);
        if (!res.ok) return;
        const run = await res.json();
        if (run.status !== "running") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          router.refresh();
        }
      }, 2000);
    } catch {
      setIsRunning(false);
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={isRunning}
      className={`flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${className ?? ""}`}
    >
      <RefreshCw className={`w-3 h-3 ${isRunning ? "animate-spin" : ""}`} />
      {isRunning ? "Running…" : "Retry"}
    </button>
  );
}
