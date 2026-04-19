"use client";

import * as React from "react";
import useSWR from "swr";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle, Timeframe } from "@/lib/data-core/types";
import { cn } from "@/lib/utils";

const TFS: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ChartView({ symbol, initialTf = "15m" }: { symbol: string; initialTf?: Timeframe }) {
  const [tf, setTf] = React.useState<Timeframe>(initialTf);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ISeriesApi<"Candlestick"> | null>(null);

  const { data } = useSWR<{ candles: Candle[] }>(
    `/api/v1/candles?symbol=${encodeURIComponent(symbol)}&tf=${tf}&limit=240`,
    fetcher,
    { refreshInterval: 5_000 },
  );

  React.useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: getCssVar("--muted-foreground"),
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: hsl(getCssVar("--border"), 0.5) },
        horzLines: { color: hsl(getCssVar("--border"), 0.5) },
      },
      rightPriceScale: { borderColor: hsl(getCssVar("--border"), 1) },
      timeScale: { borderColor: hsl(getCssVar("--border"), 1) },
      crosshair: { mode: 1 },
    });
    const series = chart.addCandlestickSeries({
      upColor: hsl(getCssVar("--bid"), 1),
      downColor: hsl(getCssVar("--ask"), 1),
      borderUpColor: hsl(getCssVar("--bid"), 1),
      borderDownColor: hsl(getCssVar("--ask"), 1),
      wickUpColor: hsl(getCssVar("--bid"), 1),
      wickDownColor: hsl(getCssVar("--ask"), 1),
    });
    chartRef.current = chart;
    seriesRef.current = series;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!seriesRef.current || !data?.candles) return;
    seriesRef.current.setData(
      data.candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1 p-2">
        <span className="mr-2 font-mono text-xs text-muted-foreground">{symbol}</span>
        {TFS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTf(t)}
            className={cn(
              "rounded px-2 py-1 font-mono text-[11px]",
              tf === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="min-h-[360px] flex-1" />
    </div>
  );
}

function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hsl(triplet: string, alpha: number): string {
  if (!triplet) return "#888";
  return `hsl(${triplet} / ${alpha})`;
}
