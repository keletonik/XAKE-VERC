"use client";

import * as React from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatUsd } from "@/lib/utils";
import type { Quote } from "@/lib/data-core/types";

type OrdersData = {
  orders: Array<{
    id: string;
    symbol: string;
    side: "buy" | "sell";
    type: "market" | "limit";
    qty: number;
    avgFillPrice: number;
    status: string;
    createdAt: number;
    reason?: string;
  }>;
  fills: Array<{
    id: string;
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    ts: number;
  }>;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PaperTicket() {
  const [symbol, setSymbol] = React.useState("BTC-USD");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [type, setType] = React.useState<"market" | "limit">("market");
  const [qty, setQty] = React.useState("0.01");
  const [limitPrice, setLimitPrice] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const { data: quoteData } = useSWR<{ quotes: Quote[] }>(
    `/api/v1/quotes?symbols=${symbol}`,
    fetcher,
    { refreshInterval: 2_000 },
  );
  const q = quoteData?.quotes[0];

  const { data: orderData, mutate: mutateOrders } = useSWR<OrdersData>(
    "/api/v1/orders",
    fetcher,
    { refreshInterval: 5_000 },
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setErr("qty must be > 0");
      return;
    }
    const body: Record<string, unknown> = { symbol, side, type, qty: qtyNum, tif: "gtc" };
    if (type === "limit") body.limitPrice = Number(limitPrice);
    const res = await fetch("/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(json.reason ?? "rejected");
    } else {
      setResult(
        json.order?.status === "filled"
          ? `Filled ${qty} @ ${formatPrice(json.order.avgFillPrice)}`
          : `Order ${json.order?.status ?? "accepted"}`,
      );
    }
    mutateOrders();
  }

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <Panel title="Paper ticket">
        <form className="flex flex-col gap-2 p-3" onSubmit={submit}>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Symbol" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Bid {q ? formatPrice(q.bid) : "—"}</span>
            <span>Ask {q ? formatPrice(q.ask) : "—"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>
              Buy
            </Button>
            <Button type="button" variant={side === "sell" ? "destructive" : "outline"} onClick={() => setSide("sell")}>
              Sell
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" size="sm" variant={type === "market" ? "secondary" : "outline"} onClick={() => setType("market")}>
              Market
            </Button>
            <Button type="button" size="sm" variant={type === "limit" ? "secondary" : "outline"} onClick={() => setType("limit")}>
              Limit
            </Button>
          </div>
          <Input type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" />
          {type === "limit" && (
            <Input type="number" step="any" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="Limit price" />
          )}
          <Button type="submit" className="mt-1">Place paper order</Button>
          {err && <div className="text-xs text-destructive">{err}</div>}
          {result && <div className="text-xs text-success">{result}</div>}
          <div className="mt-2 text-[10px] text-muted-foreground">
            Short-selling blocked · slippage 2 bps · paper only
          </div>
        </form>
      </Panel>

      <Panel title="Recent orders">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface hairline text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Symbol</th>
              <th className="px-4 py-2">Side</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Avg</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orderData?.orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-border/60">
                <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">
                  {new Date(o.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2 font-mono">{o.symbol}</td>
                <td className="px-4 py-2">
                  <Badge variant={o.side === "buy" ? "success" : "destructive"}>{o.side}</Badge>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{o.type}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">{o.qty}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {o.avgFillPrice ? formatUsd(o.avgFillPrice) : "—"}
                </td>
                <td className="px-4 py-2">
                  <Badge variant={o.status === "filled" ? "success" : "secondary"}>{o.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
