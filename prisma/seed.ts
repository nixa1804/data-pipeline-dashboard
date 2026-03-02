import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { subDays, subHours, subMinutes } from "date-fns";
import { config } from "dotenv";
config({ path: ".env.local", override: true });
config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.alert.deleteMany();
  await prisma.pipelineRun.deleteMany();
  await prisma.pipeline.deleteMany();

  const now = new Date();

  const pip1 = await prisma.pipeline.create({
    data: {
      name: "Sales Events → Warehouse",
      description: "Ingests raw sales events from Kafka and loads to BigQuery",
      status: "active",
      schedule: "*/15 * * * *",
      source: "Kafka: sales-events",
      destination: "BigQuery: analytics.sales",
    },
  });

  const pip2 = await prisma.pipeline.create({
    data: {
      name: "User Profiles Sync",
      description: "Syncs user profile changes from Postgres to Elasticsearch",
      status: "active",
      schedule: "0 */1 * * *",
      source: "Postgres: users",
      destination: "Elasticsearch: profiles",
    },
  });

  const pip3 = await prisma.pipeline.create({
    data: {
      name: "Inventory Snapshot",
      description: "Daily snapshot of inventory levels to S3 data lake",
      status: "active",
      schedule: "0 2 * * *",
      source: "MySQL: inventory",
      destination: "S3: datalake/inventory",
    },
  });

  const pip4 = await prisma.pipeline.create({
    data: {
      name: "Marketing Attribution",
      description: "Joins ad spend data with conversion events for attribution modeling",
      status: "active",
      schedule: "0 6 * * *",
      source: "Google Ads API + S3",
      destination: "Redshift: marketing",
    },
  });

  const pip5 = await prisma.pipeline.create({
    data: {
      name: "Customer Churn Scores",
      description: "Runs ML churn model predictions and writes scores to feature store",
      status: "active",
      schedule: "0 3 * * *",
      source: "Redshift: analytics",
      destination: "Redis: feature-store",
    },
  });

  const pip6 = await prisma.pipeline.create({
    data: {
      name: "Finance Ledger Export",
      description: "Exports daily ledger entries to the accounting system via SFTP",
      status: "inactive",
      schedule: "0 23 * * *",
      source: "Postgres: finance",
      destination: "SFTP: accounting-system",
    },
  });

  for (let i = 0; i < 12; i++) {
    await prisma.pipelineRun.create({
      data: {
        pipelineId: pip1.id,
        status: i === 3 ? "failed" : "success",
        startedAt: subMinutes(now, 15 * (i + 1)),
        finishedAt: subMinutes(now, 15 * (i + 1) - 2),
        durationMs: 2000 + Math.floor(Math.random() * 1500),
        rowsProcessed: 12000 + Math.floor(Math.random() * 5000),
        errorMessage: i === 3 ? "Schema mismatch in column `event_type`" : null,
      },
    });
  }

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip2.id,
      status: "failed",
      startedAt: subMinutes(now, 62),
      finishedAt: subMinutes(now, 60),
      durationMs: 1200,
      rowsProcessed: 0,
      errorMessage: "Connection timeout: Elasticsearch cluster unreachable after 3 retries",
    },
  });

  for (let i = 0; i < 8; i++) {
    await prisma.pipelineRun.create({
      data: {
        pipelineId: pip2.id,
        status: i === 5 ? "failed" : "success",
        startedAt: subHours(now, i + 2),
        finishedAt: subHours(now, i + 2 - 0.05),
        durationMs: 2500 + Math.floor(Math.random() * 1200),
        rowsProcessed: i === 5 ? 0 : 3000 + Math.floor(Math.random() * 2000),
        errorMessage: i === 5 ? "Timeout after 3000 ms" : null,
      },
    });
  }

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip3.id,
      status: "success",
      startedAt: subHours(now, 22),
      finishedAt: subHours(now, 21),
      durationMs: 58400,
      rowsProcessed: 284901,
      errorMessage: null,
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip4.id,
      status: "running",
      startedAt: subMinutes(now, 5),
      finishedAt: null,
      durationMs: null,
      rowsProcessed: null,
      errorMessage: null,
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip5.id,
      status: "failed",
      startedAt: subHours(now, 21),
      finishedAt: subHours(now, 20),
      durationMs: 43200,
      rowsProcessed: 0,
      errorMessage: "OOM error: Memory limit exceeded (8 GB) during model inference step",
    },
  });

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip6.id,
      status: "skipped",
      startedAt: subDays(now, 5),
      finishedAt: subDays(now, 5),
      durationMs: 0,
      rowsProcessed: 0,
      errorMessage: null,
    },
  });

  const pip7 = await prisma.pipeline.create({
    data: {
      name: "Clickstream → Data Lake",
      description: "Streams raw clickstream events from Kinesis into S3 Parquet partitions",
      status: "active",
      schedule: "*/5 * * * *",
      source: "Kinesis: clickstream",
      destination: "S3: datalake/clickstream",
      itemUnit: "events",
    },
  });

  const pip8 = await prisma.pipeline.create({
    data: {
      name: "Order Fulfillment Sync",
      description: "Replicates order fulfillment status from ERP to customer-facing API DB",
      status: "active",
      schedule: "*/10 * * * *",
      source: "SAP ERP",
      destination: "Postgres: orders",
      itemUnit: "orders",
    },
  });

  const pip9 = await prisma.pipeline.create({
    data: {
      name: "Payment Events Audit",
      description: "Archives all payment events to immutable audit log in BigQuery",
      status: "active",
      schedule: "*/1 * * * *",
      source: "Stripe API",
      destination: "BigQuery: audit.payments",
      itemUnit: "transactions",
    },
  });

  const pip10 = await prisma.pipeline.create({
    data: {
      name: "Email Campaign Metrics",
      description: "Pulls open/click rates from Mailchimp and loads to reporting DB",
      status: "inactive",
      schedule: "0 8 * * *",
      source: "Mailchimp API",
      destination: "Postgres: marketing_reports",
      itemUnit: "campaigns",
    },
  });

  const pip11 = await prisma.pipeline.create({
    data: {
      name: "Product Catalog CDN Sync",
      description: "Pushes updated product catalog JSON to CDN edge locations",
      status: "active",
      schedule: "0 */4 * * *",
      source: "Postgres: catalog",
      destination: "CloudFront: cdn/catalog",
      itemUnit: "products",
    },
  });

  for (let i = 0; i < 24; i++) {
    const failed = i === 7 || i === 15;
    await prisma.pipelineRun.create({
      data: {
        pipelineId: pip7.id,
        status: failed ? "failed" : "success",
        startedAt: subMinutes(now, 5 * (i + 1)),
        finishedAt: subMinutes(now, 5 * (i + 1) - 1),
        durationMs: failed ? 800 : 400 + Math.floor(Math.random() * 600),
        rowsProcessed: failed ? 0 : 50000 + Math.floor(Math.random() * 30000),
        errorMessage: failed ? "Kinesis shard iterator expired — checkpoint lost" : null,
      },
    });
  }

  for (let i = 0; i < 18; i++) {
    await prisma.pipelineRun.create({
      data: {
        pipelineId: pip8.id,
        status: i === 11 ? "failed" : "success",
        startedAt: subMinutes(now, 10 * (i + 1)),
        finishedAt: subMinutes(now, 10 * (i + 1) - 3),
        durationMs: 3000 + Math.floor(Math.random() * 2000),
        rowsProcessed: i === 11 ? 0 : 200 + Math.floor(Math.random() * 800),
        errorMessage: i === 11 ? "SAP RFC call failed: connection pool exhausted" : null,
      },
    });
  }

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip9.id,
      status: "running",
      startedAt: subMinutes(now, 1),
      finishedAt: null,
      durationMs: null,
      rowsProcessed: null,
      errorMessage: null,
    },
  });

  for (let i = 0; i < 30; i++) {
    await prisma.pipelineRun.create({
      data: {
        pipelineId: pip9.id,
        status: "success",
        startedAt: subMinutes(now, i + 2),
        finishedAt: subMinutes(now, i + 1),
        durationMs: 500 + Math.floor(Math.random() * 400),
        rowsProcessed: 10 + Math.floor(Math.random() * 100),
        errorMessage: null,
      },
    });
  }

  await prisma.pipelineRun.create({
    data: {
      pipelineId: pip10.id,
      status: "success",
      startedAt: subDays(now, 3),
      finishedAt: subDays(now, 3),
      durationMs: 12400,
      rowsProcessed: 47,
      errorMessage: null,
    },
  });

  for (let i = 0; i < 6; i++) {
    const failed = i === 2;
    await prisma.pipelineRun.create({
      data: {
        pipelineId: pip11.id,
        status: failed ? "failed" : "success",
        startedAt: subHours(now, 4 * (i + 1)),
        finishedAt: subHours(now, 4 * (i + 1) - 0.1),
        durationMs: failed ? 600 : 280 + Math.floor(Math.random() * 300),
        rowsProcessed: failed ? 0 : 3000 + Math.floor(Math.random() * 1500),
        errorMessage: failed ? "CloudFront invalidation quota exceeded (1000/day)" : null,
      },
    });
  }

  await prisma.alert.createMany({
    data: [
      {
        pipelineId: pip2.id,
        severity: "critical",
        message: "Pipeline failed 3 consecutive times — Elasticsearch connection timeout",
        status: "active",
        triggeredAt: subMinutes(now, 60),
      },
      {
        pipelineId: pip5.id,
        severity: "critical",
        message: "OOM error during model inference — run aborted after 43 min",
        status: "active",
        triggeredAt: subHours(now, 21),
      },
      {
        pipelineId: pip1.id,
        severity: "warning",
        message: "P95 latency exceeded 5 s SLA threshold (currently 6.2 s)",
        status: "acknowledged",
        triggeredAt: subHours(now, 3),
      },
      {
        pipelineId: pip4.id,
        severity: "info",
        message: "Row count deviation detected: 12% fewer rows than yesterday's run",
        status: "active",
        triggeredAt: subMinutes(now, 20),
      },
      {
        pipelineId: pip3.id,
        severity: "warning",
        message: "Duration exceeded 60 s moving average by 2x",
        status: "resolved",
        triggeredAt: subDays(now, 1),
        resolvedAt: subHours(now, 20),
      },
      {
        pipelineId: pip7.id,
        severity: "critical",
        message: "Kinesis shard iterator expired — 2 failed runs in last 15 min",
        status: "active",
        triggeredAt: subMinutes(now, 15),
      },
      {
        pipelineId: pip8.id,
        severity: "warning",
        message: "SAP RFC connection pool exhausted — 1 run failed",
        status: "acknowledged",
        triggeredAt: subMinutes(now, 110),
      },
      {
        pipelineId: pip11.id,
        severity: "warning",
        message: "CloudFront invalidation quota hit — catalog sync skipped",
        status: "resolved",
        triggeredAt: subHours(now, 10),
        resolvedAt: subHours(now, 6),
      },
    ],
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
