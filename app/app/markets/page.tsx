import Link from "next/link";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function MarketsPage() {
  const p = getMarketProvider();
  const rows = p.listInstruments().map((i) => ({ i, q: p.getQuote(i.symbol) }));

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <Panel title="Market explorer">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface hairline text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Symbol</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2 text-right">Bid</th>
              <th className="px-4 py-2 text-right">Ask</th>
              <th className="px-4 py-2 text-right">Last</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ i, q }) => (
              <tr key={i.symbol} className="border-b border-border/60 hover:bg-surface-elevated">
                <td className="px-4 py-2 font-mono font-semibold">{i.symbol}</td>
                <td className="px-4 py-2 text-muted-foreground">{i.displayName}</td>
                <td className="px-4 py-2">
                  <Badge variant="secondary">{i.assetClass}</Badge>
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums text-bid">
                  {q ? formatPrice(q.bid, i.tickSize < 1 ? 4 : 2) : "—"}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums text-ask">
                  {q ? formatPrice(q.ask, i.tickSize < 1 ? 4 : 2) : "—"}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {q ? formatPrice(q.last, i.tickSize < 1 ? 4 : 2) : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/app/charts?symbol=${encodeURIComponent(i.symbol)}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Chart →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
