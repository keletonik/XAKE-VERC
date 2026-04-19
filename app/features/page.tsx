import Link from "next/link";
import { Button } from "@/components/ui/button";

const features: Array<{ title: string; body: string }> = [
  {
    title: "Chart-first workspace",
    body: "TradingView Lightweight Charts, XAKE design tokens, crosshair, timeframe switcher, instrument switcher, and deterministic mock data out of the box.",
  },
  {
    title: "Vercel-native backend",
    body: "All server code runs as Next.js Route Handlers. SSE streams for quotes and the assistant. Vercel Cron evaluates alerts every five minutes.",
  },
  {
    title: "Paper trading engine",
    body: "Deterministic paper fills with 2 bps slippage, limit matching against live ticks, weighted-average cost, short-selling blocked by default.",
  },
  {
    title: "Alerts you can trust",
    body: "Price and percent-move conditions, SHA-1 deduped, cooldowns honoured. Evaluated on the Vercel cron; history retained in-memory with a hard cap.",
  },
  {
    title: "Claude co-pilot",
    body: "Claude Sonnet 4.6 with Haiku 4.5 fallback. Streamed via Server-Sent Events. The assistant can analyse and draft — humans confirm every action.",
  },
  {
    title: "Honest by design",
    body: "No live execution, no unlicensed realtime data in production, no hidden live mode. The paper environment is visually unmistakable.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Link href="/" className="mb-6 inline-block text-xs text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
      <h1 className="font-mono text-3xl font-bold">Features</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Everything XAKE ships today. All of it runs on Vercel with zero additional infrastructure.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-md border border-border bg-surface p-5">
            <div className="text-sm font-semibold">{f.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Button asChild>
          <Link href="/app">Open cockpit</Link>
        </Button>
      </div>
    </div>
  );
}
