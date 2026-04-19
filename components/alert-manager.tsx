"use client";

import * as React from "react";
import useSWR from "swr";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type Alert = {
  id: string;
  name: string;
  enabled: boolean;
  firedCount: number;
  condition:
    | { kind: "price"; symbol: string; op: "gt" | "lt"; value: number }
    | { kind: "percent_move"; symbol: string; windowMinutes: number; thresholdPct: number };
  cooldownMinutes: number;
};

type Firing = {
  id: string;
  alertId: string;
  firedAt: number;
  reason: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AlertManager() {
  const { data, mutate } = useSWR<{ alerts: Alert[]; firings: Firing[] }>(
    "/api/v1/alerts",
    fetcher,
    { refreshInterval: 5_000 },
  );

  const [name, setName] = React.useState("BTC > 70k");
  const [symbol, setSymbol] = React.useState("BTC-USD");
  const [op, setOp] = React.useState<"gt" | "lt">("gt");
  const [value, setValue] = React.useState("70000");
  const [cooldown, setCooldown] = React.useState("5");
  const [err, setErr] = React.useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const num = Number(value);
    if (!Number.isFinite(num)) {
      setErr("price must be a number");
      return;
    }
    const res = await fetch("/api/v1/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        cooldownMinutes: Number(cooldown) || 5,
        condition: { kind: "price", symbol, op, value: num },
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error === "duplicate_condition" ? "Duplicate alert" : "Failed to save");
      return;
    }
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/v1/alerts?id=${id}`, { method: "DELETE" });
    mutate();
  }

  const alerts = data?.alerts ?? [];
  const firings = data?.firings ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <Panel title="Alerts">
        <form className="flex flex-col gap-2 p-3 hairline" onSubmit={create}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Symbol" />
            <select value={op} onChange={(e) => setOp(e.target.value as "gt" | "lt")} className="h-9 rounded-md border border-input bg-surface px-2 text-sm">
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Price" />
            <Input type="number" min="0" value={cooldown} onChange={(e) => setCooldown(e.target.value)} placeholder="Cooldown (min)" />
          </div>
          {err && <div className="text-xs text-destructive">{err}</div>}
          <Button type="submit" size="sm">
            <Bell className="size-3" /> Create alert
          </Button>
        </form>

        {alerts.length === 0 ? (
          <EmptyState title="No alerts yet" description="Create a price alert above. The cron runs every 5 minutes." />
        ) : (
          <ul className="divide-y divide-border">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {a.condition.kind === "price"
                      ? `${a.condition.symbol} ${a.condition.op === "gt" ? ">" : "<"} ${a.condition.value}`
                      : `${a.condition.symbol} %move ${a.condition.thresholdPct}% / ${a.condition.windowMinutes}m`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={a.firedCount ? "success" : "secondary"}>fired {a.firedCount}</Badge>
                  <button className="text-muted-foreground hover:text-destructive" aria-label="Delete" onClick={() => remove(a.id)}>
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Firings (last 50)">
        {firings.length === 0 ? (
          <EmptyState title="No firings yet" description="Alerts that cross their threshold will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {firings.map((f) => (
              <li key={f.id} className="px-4 py-2 text-sm">
                <div className="font-mono text-xs">{new Date(f.firedAt).toLocaleString()}</div>
                <div>{f.reason}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
