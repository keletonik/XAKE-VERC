"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

type Health = {
  ok: boolean;
  env: "paper" | "live";
  version: string;
  feed: { provider: string; feedClass: string; ageMs: number | null };
  ai: { configured: boolean; model: string };
  now: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function StatusRail() {
  const { data, error } = useSWR<Health>("/api/v1/health", fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });

  const feedOk =
    data?.feed?.ageMs !== null && data?.feed?.ageMs !== undefined
      ? data.feed.ageMs < 60_000
      : true;

  return (
    <footer className="flex h-7 items-center justify-between border-t border-border bg-surface-sunken px-3 text-[11px] font-mono text-muted-foreground">
      <div className="flex items-center gap-3">
        <Dot ok={!error && !!data} />
        <span>API {error ? "unreachable" : data ? "ok" : "…"}</span>
        <span className="opacity-40">•</span>
        <Dot ok={feedOk} />
        <span>feed {data?.feed.provider ?? "…"}</span>
        <span className="opacity-40">•</span>
        <Dot ok={!!data?.ai.configured} warn={!data?.ai.configured} />
        <span>ai {data?.ai.configured ? "live" : "stub"}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="uppercase tracking-wider">{data?.env ?? "paper"}</span>
        <span>v{data?.version ?? "0.0.0"}</span>
      </div>
    </footer>
  );
}

function Dot({ ok, warn }: { ok: boolean; warn?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 rounded-full",
        ok && !warn ? "bg-success" : warn ? "bg-warning animate-pulse" : "bg-destructive animate-pulse",
      )}
    />
  );
}
