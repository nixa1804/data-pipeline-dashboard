# Pipeline Monitor

Real-time ETL pipeline observability dashboard. Monitor pipeline health, run history, latency trends, and alerts in one place.

## Features

- **Dashboard** — overview stats, latency trend (24h), run volume (7d), recent pipeline cards and alerts
- **Pipelines** — list of all pipelines with status filter, success rate, avg duration, last run info
- **Alerts** — alert log with severity levels (critical, warning, info) and status tracking
- **Metrics** — historical charts for latency and run volume with key stats
- **Settings** — configurable refresh interval and alert thresholds, persisted in localStorage
- **Retry** — retry failed pipelines directly from the dashboard or detail page; polling detects completion in real time
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
| `Pipeline` | ETL pipeline definition (name, status, schedule, source, destination) |
| `PipelineRun` | Individual run record (status, duration, rows processed, error) |
| `Alert` | Alert triggered for a pipeline (severity, status, timestamps) |

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
| `PIPELINE_API_URL` | No | Base URL of external pipeline execution API. If not set, retry runs in simulation mode |
| `PIPELINE_API_SECRET` | No | Bearer token for `PIPELINE_API_URL` authentication |
| `WEBHOOK_SECRET` | No | Secret for validating incoming webhook calls to `/api/webhooks/pipeline` |

## Deployment (Vercel)

1. Push to `main` — Vercel auto-deploys on every push
2. Set `DATABASE_URL` in Vercel project settings → Environment Variables
3. Seed production database once if needed:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/pipelines` | GET | List pipelines (supports `?status=` filter) |
| `/api/alerts` | GET | List alerts (supports `?status=` filter) |
| `/api/runs/[id]` | GET | Get run status by ID — used for retry polling |
| `/api/webhooks/pipeline` | POST | Receive pipeline completion callback from external system |

`/api/pipelines` and `/api/alerts` are rate-limited per IP. `/api/webhooks/pipeline` requires `x-webhook-secret` header if `WEBHOOK_SECRET` env var is set.

### Webhook payload

```json
POST /api/webhooks/pipeline
x-webhook-secret: <WEBHOOK_SECRET>

{
  "runId": "clx...",
  "status": "success",
  "durationMs": 3200,
  "rowsProcessed": 14500,
  "errorMessage": null
}
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run db:seed    # Seed database with demo data
```
