# Pipeline Monitor

Universal job observability dashboard. Integrate any application or scheduled task — monitor health, run history, latency trends, and alerts in one place.

## Features

- **Dashboard** — overview stats, latency trend (24h), run volume (7d), recent job cards and alerts
- **Pipelines** — list of all jobs with status filter, success rate, avg duration, last run info
- **Alerts** — alert log with severity levels (critical, warning, info) and status tracking
- **Metrics** — historical charts for latency and run volume with key stats
- **Settings** — configurable refresh interval and alert thresholds, persisted in localStorage
- **Retry** — retry failed jobs directly from the dashboard or detail page; polling detects completion in real time
- Responsive layout with mobile sidebar drawer
- Auto-refresh with configurable interval

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, server components, force-dynamic rendering
- [Prisma 7](https://www.prisma.io/) — ORM with PostgreSQL adapter
- [Neon](https://neon.tech/) — serverless PostgreSQL
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — latency and volume charts
- [Vercel](https://vercel.com/) — hosting + analytics

## Database Schema

| Model | Description |
|---|---|
| `Pipeline` | Job definition (name, status, schedule, source, destination, itemUnit) |
| `PipelineRun` | Individual run record (status, duration, items processed, error) |
| `Alert` | Alert triggered for a job (severity, status, timestamps) |

## Local Development

**Prerequisites:** Node.js 20+, PostgreSQL (or use Neon connection string directly)

```bash
# Install dependencies
npm install

# Copy env file and fill in your DATABASE_URL
cp .env.example .env.local

# Push schema to database
npx prisma db push

# Seed with demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> `.env.local` takes priority over `.env` in Next.js. The seed script reads `.env.local` first, so both the app and seed always use the same database.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JOB_API_SECRET` | No | API key for management endpoints (`/api/jobs`, `/api/runs`, `/api/alerts` POST/PATCH). If not set, endpoints are open |
| `WEBHOOK_SECRET` | No | Secret for validating incoming webhook calls to `/api/webhooks/pipeline` |
| `PIPELINE_API_URL` | No | Base URL of external pipeline execution API. If not set, retry runs in simulation mode |
| `PIPELINE_API_SECRET` | No | Bearer token for `PIPELINE_API_URL` authentication |

## Deployment (Vercel)

1. Push to `main` — Vercel auto-deploys on every push
2. Set `DATABASE_URL` in Vercel project settings → Environment Variables
3. Seed production database once if needed:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

## Integrating an Application

Any application can integrate using 3 API calls:

### 1. Register the job (once)

```bash
POST /api/jobs
x-api-key: <JOB_API_SECRET>

{
  "name": "Daily newsletter",
  "description": "Sends newsletter to subscribers",
  "schedule": "0 8 * * *",
  "source": "template-engine",
  "destination": "SendGrid",
  "itemUnit": "emails"
}
# ← { "id": "clx...", "name": "Daily newsletter" }
```

`source`, `destination`, `schedule`, and `itemUnit` are all optional.

### 2a. Two-step flow (track running state)

```bash
# When job starts
POST /api/runs
x-api-key: <JOB_API_SECRET>
{ "jobId": "clx..." }
# ← { "runId": "clx..." }

# When job finishes
POST /api/webhooks/pipeline
x-webhook-secret: <WEBHOOK_SECRET>
{ "runId": "clx...", "status": "success", "durationMs": 1200, "itemsProcessed": 842 }
```

### 2b. Single-shot flow (report after completion)

```bash
POST /api/webhooks/pipeline
x-webhook-secret: <WEBHOOK_SECRET>

{
  "jobId": "clx...",
  "status": "success",
  "startedAt": "2026-02-23T08:00:00.000Z",
  "durationMs": 1200,
  "itemsProcessed": 842,
  "errorMessage": null
}
# ← { "ok": true, "runId": "clx..." }
```

If `startedAt` is omitted, it is inferred as `finishedAt - durationMs`.

### 3. Create an alert (optional)

```bash
POST /api/alerts
x-api-key: <JOB_API_SECRET>

{
  "jobId": "clx...",
  "severity": "critical",
  "message": "Disk usage at 95%"
}
# ← { "id": "clx..." }
```

`jobId` is optional — alerts can be unrelated to a specific job.

## API Routes

### Management (require `x-api-key` if `JOB_API_SECRET` is set)

| Endpoint | Method | Description |
|---|---|---|
| `/api/jobs` | POST | Register a new job |
| `/api/jobs/[id]` | PATCH | Update job name, status, schedule, source, destination, or itemUnit |
| `/api/runs` | POST | Start a run, returns `runId` |
| `/api/alerts` | POST | Create an alert |
| `/api/alerts/[id]` | PATCH | Update alert status (`active`, `acknowledged`, `resolved`) |

### Webhook (requires `x-webhook-secret` if `WEBHOOK_SECRET` is set)

| Endpoint | Method | Description |
|---|---|---|
| `/api/webhooks/pipeline` | POST | Complete a run by `runId`, or create+complete in one shot by `jobId` |

### Read (rate-limited per IP)

| Endpoint | Method | Description |
|---|---|---|
| `/api/pipelines` | GET | List all jobs (supports `?status=` filter) |
| `/api/alerts` | GET | List all alerts (supports `?status=` filter) |
| `/api/runs/[id]` | GET | Get run status by ID — used for retry polling |

### Webhook payload reference

```json
POST /api/webhooks/pipeline
x-webhook-secret: <WEBHOOK_SECRET>

{
  "runId":         "clx...",      // option A: update existing run
  "jobId":         "clx...",      // option B: create+complete in one shot
  "status":        "success",     // required — success | failed | skipped
  "startedAt":     "2026-...",    // option B only, optional (inferred if omitted)
  "durationMs":    3200,          // optional
  "itemsProcessed": 14500,        // optional (also accepts rowsProcessed)
  "errorMessage":  null           // optional
}
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run db:seed    # Seed database with demo data
```
