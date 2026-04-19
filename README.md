# XAKE-VERC

**XAKE rebuilt for Vercel.** A single Next.js 15 App Router app that bundles the
entire trading decision cockpit — UI, API, SSE streams, paper trading engine,
alert evaluator, and Claude assistant — into one deployable unit.

> Paper environment only. No live execution. AI never places trades.

## Quick start

```bash
pnpm install    # or: npm install
cp .env.example .env.local
pnpm dev        # http://localhost:3000
```

Optional env:

```bash
ANTHROPIC_API_KEY=sk-ant-...     # enables real Claude; otherwise a stub streams
CRON_SECRET=...                  # required in prod, cron is public in dev
```

## Deploy to Vercel

```bash
vercel        # link the project
vercel env add ANTHROPIC_API_KEY
vercel env add CRON_SECRET
vercel --prod
```

The `vercel.json` declares two crons:

- `/api/v1/cron/evaluate-alerts` every 5 minutes
- `/api/v1/cron/health-sweep` every 10 minutes

Both are gated by `CRON_SECRET` in production.

## Hard constraints

- No live execution.
- No fabricated brokerage.
- No unlicensed realtime data in production.
- AI drafts, humans confirm.
- Paper environment is always visually unmistakable.
