"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CandlestickChart,
  LayoutDashboard,
  LineChart,
  List,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { EnvBadge } from "./ui/env-badge";
import { Kbd } from "./ui/kbd";
import { cn } from "@/lib/utils";
import { StatusRail } from "./status-rail";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/markets", label: "Markets", icon: BarChart3 },
  { href: "/app/charts", label: "Charts", icon: CandlestickChart },
  { href: "/app/watchlists", label: "Watchlists", icon: List },
  { href: "/app/alerts", label: "Alerts", icon: Bell },
  { href: "/app/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/app/paper", label: "Paper", icon: LineChart },
  { href: "/app/assistant", label: "Assistant", icon: Bot },
];

export function AppShell({
  children,
  environment,
}: {
  children: React.ReactNode;
  environment: "paper" | "live";
}) {
  const path = usePathname();
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-12 items-center justify-between border-b border-border bg-surface px-3">
        <div className="flex items-center gap-3">
          <Link href="/app" className="flex items-center gap-2 font-mono font-bold tracking-widest">
            <span className="inline-block size-2 rounded-sm bg-primary" />
            XAKE
          </Link>
          <EnvBadge environment={environment} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden md:inline">
            Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> for command palette
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-48 shrink-0 flex-col border-r border-border bg-surface py-3 md:flex">
          <nav className="flex flex-col gap-0.5 px-2">
            {nav.map((n) => {
              const active = path === n.href || (n.href !== "/app" && path?.startsWith(n.href));
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="size-3" />
              <span>paper mode — no live execution</span>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>

      <StatusRail />
    </div>
  );
}
