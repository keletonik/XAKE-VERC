"use client";

import * as React from "react";
import useSWR from "swr";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import type { Quote } from "@/lib/data-core/types";
import { formatPercent, formatPrice } from "@/lib/utils";

type Watchlist = {
  id: string;
  name: string;
  symbols: string[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function WatchlistManager() {
  const { data, mutate } = useSWR<{ watchlist: Watchlist }>("/api/v1/watchlists", fetcher);
  const [newSymbol, setNewSymbol] = React.useState("");
  const wl = data?.watchlist;

  const { data: quoteData } = useSWR<{ quotes: Quote[] }>(
    wl ? `/api/v1/quotes?symbols=${wl.symbols.join(",")}` : null,
    fetcher,
    { refreshInterval: 3_000 },
  );
  const quotes = Object.fromEntries((quoteData?.quotes ?? []).map((q) => [q.symbol, q]));

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/v1/watchlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) mutate();
  }

  return (
    <Panel title={wl ? `${wl.name}` : "Watchlist"}>
      <div className="flex items-center gap-2 p-3 hairline">
        <Input
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          placeholder="Add symbol (e.g. BTC-USD)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newSymbol) {
              patch({ add: [newSymbol] });
              setNewSymbol("");
            }
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            if (newSymbol) {
              patch({ add: [newSymbol] });
              setNewSymbol("");
            }
          }}
        >
          <Plus className="size-3" /> Add
        </Button>
      </div>

      <ul className="divide-y divide-border">
        {wl?.symbols.map((s) => {
          const q = quotes[s];
          return (
            <li key={s} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-surface-elevated">
              <a href={`/app/charts?symbol=${encodeURIComponent(s)}`} className="font-mono font-semibold hover:text-primary">
                {s}
              </a>
              <div className="flex items-center gap-4 font-mono text-xs">
                {q ? (
                  <>
                    <span className="tabular-nums">{formatPrice(q.last, q.ask > 100 ? 2 : 4)}</span>
                    <span className={q.last >= q.bid ? "text-success" : "text-destructive"}>
                      {formatPercent(((q.last - q.bid) / q.bid) * 100)}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
                <button
                  aria-label={`Remove ${s}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => patch({ remove: [s] })}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
