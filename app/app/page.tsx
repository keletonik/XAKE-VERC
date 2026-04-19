import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TickerTape } from "@/components/ticker-tape";
import { currentAccountId } from "@/lib/auth/current-user";
import { store } from "@/lib/store/memory";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { snapshot } from "@/lib/trading-core/paper-engine";
import { formatUsd, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const accountId = await currentAccountId();
  const wl = store.ensureWatchlist(accountId);
  const state = store.ensurePaper(accountId);
  const provider = getMarketProvider();
  const snap = snapshot(state, (s) => provider.getQuote(s));
  const alertCount = [...store.alerts.values()].filter((a) => a.accountId === accountId).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TickerTape symbols={wl.symbols} />

      <div className="grid flex-1 min-h-0 gap-4 p-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Paper equity</CardTitle>
            <CardDescription>
              Starting cash {formatUsd(state.cash + snap.positions.reduce((a, p) => a + p.qty * p.avgCost, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="font-mono text-3xl">{formatUsd(snap.equity)}</div>
            <div className="text-xs text-muted-foreground">
              Realised {formatUsd(snap.realisedPnl)} · Unrealised {formatUsd(snap.unrealisedPnl)}
            </div>
            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/app/portfolio">
                  View portfolio <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary watchlist</CardTitle>
            <CardDescription>{wl.name} · {wl.symbols.length} symbols</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-sm">
              {wl.symbols.slice(0, 6).map((s) => {
                const q = provider.getQuote(s);
                const pct = q ? ((q.last - q.bid) / q.bid) * 100 : 0;
                return (
                  <li key={s} className="flex items-center justify-between font-mono">
                    <span>{s}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {q ? q.last.toFixed(q.ask > 100 ? 2 : 4) : "—"}{" "}
                      <span className={pct >= 0 ? "text-success" : "text-destructive"}>
                        {formatPercent(pct)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/app/watchlists">
                  Manage watchlists <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>{alertCount} configured · cron every 5m</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground">
              Price and percent-move conditions, cooldowns honoured. Cron runs on Vercel.
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/alerts">
                Open alerts <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
