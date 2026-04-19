"use client";

import * as React from "react";
import useSWR from "swr";
import { formatPercent, formatPrice, cn } from "@/lib/utils";
import type { Quote } from "@/lib/data-core/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TickerTape({ symbols }: { symbols: string[] }) {
  const key = `/api/v1/quotes?symbols=${symbols.join(",")}`;
  const { data } = useSWR<{ quotes: Quote[] }>(key, fetcher, { refreshInterval: 3_000 });
  const prev = React.useRef<Record<string, number>>({});

  const quotes = data?.quotes ?? [];

  return (
    <div className="flex h-10 items-center gap-5 overflow-x-auto border-b border-border bg-surface px-3 scrollbar-thin">
      {quotes.map((q) => {
        const last = q.last;
        const p = prev.current[q.symbol];
        const delta = p ? ((last - p) / p) * 100 : 0;
        prev.current[q.symbol] = last;
        return (
          <div key={q.symbol} className="flex shrink-0 items-center gap-2 font-mono text-xs">
            <span className="font-semibold">{q.symbol}</span>
            <span className="tabular-nums">{formatPrice(last, q.ask > 100 ? 2 : 4)}</span>
            <span className={cn("text-[11px]", delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground")}>
              {formatPercent(delta)}
            </span>
          </div>
        );
      })}
      {quotes.length === 0 && <span className="text-xs text-muted-foreground">loading quotes…</span>}
    </div>
  );
}
