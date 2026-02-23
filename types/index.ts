export type PipelineStatus = "active" | "inactive" | "deprecated";
export type RunStatus = "running" | "success" | "failed" | "skipped";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  status: PipelineStatus;
  schedule: string | null;
  source: string | null;
  destination: string | null;
  itemUnit: string | null;
  createdAt: string;
  updatedAt: string;
  lastRun?: PipelineRun | null;
  successRate?: number;
  avgDurationMs?: number;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: RunStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  rowsProcessed: number | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface Alert {
  id: string;
  pipelineId: string | null;
  pipelineName?: string | null;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  triggeredAt: string;
  resolvedAt: string | null;
}

export interface DashboardStats {
  totalPipelines: number;
  activePipelines: number;
  failedRuns24h: number;
  successRate7d: number;
  avgLatencyMs: number;
  activeAlerts: number;
}
