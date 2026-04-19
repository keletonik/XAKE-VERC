import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { currentAccountId } from "@/lib/auth/current-user";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { snapshot } from "@/lib/trading-core/paper-engine";
import { store } from "@/lib/store/memory";
import { formatUsd } from "@/lib/utils";
import { ResetButton } from "@/components/reset-button";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const accountId = await currentAccountId();
  const state = store.ensurePaper(accountId);
  const provider = getMarketProvider();
  const snap = snapshot(state, (s) => provider.getQuote(s));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Equity" value={formatUsd(snap.equity)} />
        <Stat label="Cash" value={formatUsd(snap.cash)} />
        <Stat label="Realised P&L" value={formatUsd(snap.realisedPnl)} />
        <Stat label="Unrealised P&L" value={formatUsd(snap.unrealisedPnl)} />
      </div>

      <Panel
        title="Positions"
        actions={<ResetButton />}
      >
        {snap.positions.length === 0 ? (
          <EmptyState title="No positions" description="Place a paper order to open a position." />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface hairline text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Avg cost</th>
                <th className="px-4 py-2 text-right">Mark</th>
                <th className="px-4 py-2 text-right">Unrealised</th>
                <th className="px-4 py-2">Realised</th>
              </tr>
            </thead>
            <tbody>
              {snap.positions.map((p) => {
                const q = provider.getQuote(p.symbol);
                const mark = q?.last ?? p.avgCost;
                const unrealised = (mark - p.avgCost) * p.qty;
                return (
                  <tr key={p.symbol} className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono">{p.symbol}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{p.qty}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                      {formatUsd(p.avgCost)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                      {formatUsd(mark)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                      <Badge variant={unrealised >= 0 ? "success" : "destructive"}>
                        {formatUsd(unrealised)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 font-mono tabular-nums text-xs">
                      {formatUsd(p.realisedPnl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl tabular-nums">{value}</div>
    </div>
  );
}
