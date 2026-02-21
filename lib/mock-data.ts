import { subHours, subDays, subMinutes, formatISO } from "date-fns";
import type { Pipeline, PipelineRun, Alert, DashboardStats } from "@/types";

const now = new Date();

function iso(d: Date) {
  return formatISO(d);
}

export const mockPipelines: Pipeline[] = [
  {
    id: "pip_1",
    name: "Sales Events → Warehouse",
    description: "Ingests raw sales events from Kafka and loads to BigQuery",
    status: "active",
    schedule: "*/15 * * * *",
    source: "Kafka: sales-events",
    destination: "BigQuery: analytics.sales",
    createdAt: iso(subDays(now, 90)),
    updatedAt: iso(subHours(now, 1)),
    lastRun: {
      id: "run_1a",
      pipelineId: "pip_1",
      status: "success",
      startedAt: iso(subMinutes(now, 18)),
      finishedAt: iso(subMinutes(now, 16)),
      durationMs: 2341,
      rowsProcessed: 14872,
      errorMessage: null,
      createdAt: iso(subMinutes(now, 18)),
    },
    successRate: 98.2,
    avgDurationMs: 2580,
  },
  {
    id: "pip_2",
    name: "User Profiles Sync",
    description: "Syncs user profile changes from Postgres to Elasticsearch",
    status: "active",
    schedule: "0 */1 * * *",
    source: "Postgres: users",
    destination: "Elasticsearch: profiles",
    createdAt: iso(subDays(now, 60)),
    updatedAt: iso(subHours(now, 3)),
    lastRun: {
      id: "run_2a",
      pipelineId: "pip_2",
      status: "failed",
      startedAt: iso(subMinutes(now, 62)),
      finishedAt: iso(subMinutes(now, 60)),
      durationMs: 1200,
      rowsProcessed: 0,
      errorMessage: "Connection timeout: Elasticsearch cluster unreachable after 3 retries",
      createdAt: iso(subMinutes(now, 62)),
    },
    successRate: 91.4,
    avgDurationMs: 3100,
  },
  {
    id: "pip_3",
    name: "Inventory Snapshot",
    description: "Daily snapshot of inventory levels to S3 data lake",
    status: "active",
    schedule: "0 2 * * *",
    source: "MySQL: inventory",
    destination: "S3: datalake/inventory",
    createdAt: iso(subDays(now, 45)),
    updatedAt: iso(subHours(now, 22)),
    lastRun: {
      id: "run_3a",
      pipelineId: "pip_3",
      status: "success",
      startedAt: iso(subHours(now, 22)),
      finishedAt: iso(subHours(now, 21)),
      durationMs: 58400,
      rowsProcessed: 284901,
      errorMessage: null,
      createdAt: iso(subHours(now, 22)),
    },
    successRate: 99.1,
    avgDurationMs: 56000,
  },
  {
    id: "pip_4",
    name: "Marketing Attribution",
    description: "Joins ad spend data with conversion events for attribution modeling",
    status: "active",
    schedule: "0 6 * * *",
    source: "Google Ads API + S3",
    destination: "Redshift: marketing",
    createdAt: iso(subDays(now, 30)),
    updatedAt: iso(subHours(now, 18)),
    lastRun: {
      id: "run_4a",
      pipelineId: "pip_4",
      status: "running",
      startedAt: iso(subMinutes(now, 5)),
      finishedAt: null,
      durationMs: null,
      rowsProcessed: null,
      errorMessage: null,
      createdAt: iso(subMinutes(now, 5)),
    },
    successRate: 95.6,
    avgDurationMs: 124000,
  },
  {
    id: "pip_5",
    name: "Customer Churn Scores",
    description: "Runs ML churn model predictions and writes scores to feature store",
    status: "active",
    schedule: "0 3 * * *",
    source: "Redshift: analytics",
    destination: "Redis: feature-store",
    createdAt: iso(subDays(now, 20)),
    updatedAt: iso(subHours(now, 21)),
    lastRun: {
      id: "run_5a",
      pipelineId: "pip_5",
      status: "failed",
      startedAt: iso(subHours(now, 21)),
      finishedAt: iso(subHours(now, 20)),
      durationMs: 43200,
      rowsProcessed: 0,
      errorMessage: "OOM error: Memory limit exceeded (8 GB) during model inference step",
      createdAt: iso(subHours(now, 21)),
    },
    successRate: 87.5,
    avgDurationMs: 38000,
  },
  {
    id: "pip_6",
    name: "Finance Ledger Export",
    description: "Exports daily ledger entries to the accounting system via SFTP",
    status: "inactive",
    schedule: "0 23 * * *",
    source: "Postgres: finance",
    destination: "SFTP: accounting-system",
    createdAt: iso(subDays(now, 180)),
    updatedAt: iso(subDays(now, 5)),
    lastRun: {
      id: "run_6a",
      pipelineId: "pip_6",
      status: "skipped",
      startedAt: iso(subDays(now, 5)),
      finishedAt: iso(subDays(now, 5)),
      durationMs: 0,
      rowsProcessed: 0,
      errorMessage: null,
      createdAt: iso(subDays(now, 5)),
    },
    successRate: 100,
    avgDurationMs: 12000,
  },
];

export const mockRuns: PipelineRun[] = [
  // Historical runs for pip_1 (Sales Events)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `run_1_hist_${i}`,
    pipelineId: "pip_1",
    status: (i === 3 ? "failed" : "success") as PipelineRun["status"],
    startedAt: iso(subMinutes(now, 15 * (i + 2))),
    finishedAt: iso(subMinutes(now, 15 * (i + 2) - 2)),
    durationMs: 2000 + Math.floor(Math.random() * 1500),
    rowsProcessed: 12000 + Math.floor(Math.random() * 5000),
    errorMessage: i === 3 ? "Schema mismatch in column `event_type`" : null,
    createdAt: iso(subMinutes(now, 15 * (i + 2))),
  })),
];

export const mockAlerts: Alert[] = [
  {
    id: "alert_1",
    pipelineId: "pip_2",
    pipelineName: "User Profiles Sync",
    severity: "critical",
    message: "Pipeline failed 3 consecutive times — Elasticsearch connection timeout",
    status: "active",
    triggeredAt: iso(subMinutes(now, 60)),
    resolvedAt: null,
  },
  {
    id: "alert_2",
    pipelineId: "pip_5",
    pipelineName: "Customer Churn Scores",
    severity: "critical",
    message: "OOM error during model inference — run aborted after 43 min",
    status: "active",
    triggeredAt: iso(subHours(now, 21)),
    resolvedAt: null,
  },
  {
    id: "alert_3",
    pipelineId: "pip_1",
    pipelineName: "Sales Events → Warehouse",
    severity: "warning",
    message: "P95 latency exceeded 5 s SLA threshold (currently 6.2 s)",
    status: "acknowledged",
    triggeredAt: iso(subHours(now, 3)),
    resolvedAt: null,
  },
  {
    id: "alert_4",
    pipelineId: "pip_4",
    pipelineName: "Marketing Attribution",
    severity: "info",
    message: "Row count deviation detected: 12% fewer rows than yesterday's run",
    status: "active",
    triggeredAt: iso(subMinutes(now, 20)),
    resolvedAt: null,
  },
  {
    id: "alert_5",
    pipelineId: "pip_3",
    pipelineName: "Inventory Snapshot",
    severity: "warning",
    message: "Duration exceeded 60 s moving average by 2x",
    status: "resolved",
    triggeredAt: iso(subDays(now, 1)),
    resolvedAt: iso(subHours(now, 20)),
  },
];

export const mockStats: DashboardStats = {
  totalPipelines: 6,
  activePipelines: 5,
  failedRuns24h: 2,
  successRate7d: 94.3,
  avgLatencyMs: 3200,
  activeAlerts: 3,
};

// Latency trend data for charts — last 24 hours, one point per hour
export const mockLatencyTrend = Array.from({ length: 24 }, (_, i) => {
  const base = 2800;
  const spike = i === 20 ? 6200 : 0;
  return {
    hour: `${String(i).padStart(2, "0")}:00`,
    latencyMs: base + spike + Math.floor(Math.random() * 800),
    p95Ms: base + spike + 1400 + Math.floor(Math.random() * 600),
  };
});

// Run volume data — last 7 days
export const mockRunVolume = Array.from({ length: 7 }, (_, i) => {
  const d = subDays(now, 6 - i);
  return {
    date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    success: 80 + Math.floor(Math.random() * 20),
    failed: 1 + Math.floor(Math.random() * 6),
    skipped: Math.floor(Math.random() * 3),
  };
});
