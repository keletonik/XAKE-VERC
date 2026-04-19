import { Panel } from "@/components/ui/panel";
import { ChartView } from "@/components/chart-view";
import type { Timeframe } from "@/lib/data-core/types";

export const dynamic = "force-dynamic";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; tf?: string }>;
}) {
  const sp = await searchParams;
  const symbol = sp.symbol ?? "BTC-USD";
  const tf = (sp.tf ?? "15m") as Timeframe;
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <Panel title={`Chart — ${symbol}`} className="flex-1">
        <ChartView symbol={symbol} initialTf={tf} />
      </Panel>
    </div>
  );
}
