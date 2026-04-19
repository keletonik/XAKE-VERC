import Link from "next/link";
import { ArrowRight, BarChart3, Bell, Bot, LineChart, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/config/env";

export default function LandingPage() {
  const cfg = env();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-mono font-bold tracking-widest">
          <span className="inline-block size-2 rounded-sm bg-primary" />
          XAKE
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/features" className="hover:text-foreground">Features</Link>
          <Link href="/security" className="hover:text-foreground">Security</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
          <Button asChild size="sm">
            <Link href="/app">Open cockpit</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <section className="flex flex-col items-start gap-5 py-20 md:py-28">
          <Badge variant="paper" className="text-[11px]">
            {cfg.NEXT_PUBLIC_ENVIRONMENT.toUpperCase()} — no live execution
          </Badge>
          <h1 className="font-mono text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            A trading cockpit for operators who want{" "}
            <span className="text-primary">signal</span>, not noise.
          </h1>
          <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Chart-first, disciplined, built Vercel-native. XAKE is analysis and
            paper trading with a Claude co-pilot that can analyse, explain,
            screen, and draft — never autonomous execution.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/app">
                Open workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">See features</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-24 md:grid-cols-3">
          <Feature icon={<LineChart className="size-4" />} title="Charts that mean it" body="TradingView Lightweight Charts with XAKE tokens, timeframe switching, and deterministic mock data out of the box." />
          <Feature icon={<Bell className="size-4" />} title="Alerts with cooldowns" body="Price and percent-move conditions, SHA-1 deduped, cooldowns enforced. Evaluated on a Vercel cron every five minutes." />
          <Feature icon={<Wallet className="size-4" />} title="Paper portfolio" body="Weighted-average cost, realised and unrealised P&L, slippage-aware fills. Short-selling blocked by default." />
          <Feature icon={<Bot className="size-4" />} title="Claude co-pilot" body="Sonnet 4.6 with Haiku 4.5 fallback and SSE streaming. Drafts orders and alerts; humans confirm." />
          <Feature icon={<BarChart3 className="size-4" />} title="Market explorer" body="Screen across crypto, equities, indices, and FX. Add to watchlists, preview instruments, jump to chart." />
          <Feature icon={<Shield className="size-4" />} title="Honest about reality" body="No fake brokerage, no unlicensed real-time data in production, no AI auto-execution. Paper mode is visually unmistakable." />
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} XAKE · Built on Vercel · Paper environment only
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="mb-2 inline-flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mb-1 text-sm font-semibold">{title}</div>
      <div className="text-xs leading-relaxed text-muted-foreground">{body}</div>
    </div>
  );
}
