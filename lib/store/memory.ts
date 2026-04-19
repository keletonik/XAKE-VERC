import { uid } from "@/lib/utils";
import type { Alert, AlertFiring } from "@/lib/alerts/engine";
import type { PaperState } from "@/lib/trading-core/paper-engine";
import { freshPaperState } from "@/lib/trading-core/paper-engine";

export interface Watchlist {
  id: string;
  accountId: string;
  name: string;
  symbols: string[];
  pinned: boolean;
  note?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Preferences {
  accountId: string;
  theme: "dark" | "darker" | "light" | "system";
  density: "comfortable" | "compact";
  defaultSymbol: string;
  defaultTimeframe: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  paperStartingCash: number;
  aiTemperature: number;
  aiDraftConfirm: boolean;
  notifyFiring: boolean;
}

export const DEFAULT_PREFERENCES = (accountId: string): Preferences => ({
  accountId,
  theme: "dark",
  density: "comfortable",
  defaultSymbol: "BTC-USD",
  defaultTimeframe: "15m",
  paperStartingCash: 100_000,
  aiTemperature: 0.2,
  aiDraftConfirm: true,
  notifyFiring: true,
});

class MemoryStore {
  watchlists = new Map<string, Watchlist>();
  alerts = new Map<string, Alert>();
  firings: AlertFiring[] = [];
  preferences = new Map<string, Preferences>();
  paper = new Map<string, PaperState>();
  priceHistory = new Map<string, Array<{ ts: number; price: number }>>();

  ensureWatchlist(accountId: string): Watchlist {
    const mine = [...this.watchlists.values()].filter((w) => w.accountId === accountId);
    if (mine.length) return mine[0];
    const wl: Watchlist = {
      id: uid("wl"),
      accountId,
      name: "Primary",
      symbols: ["BTC-USD", "ETH-USD", "AAPL", "NVDA", "SPY"],
      pinned: true,
      tags: ["default"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.watchlists.set(wl.id, wl);
    return wl;
  }

  ensurePrefs(accountId: string): Preferences {
    let p = this.preferences.get(accountId);
    if (!p) {
      p = DEFAULT_PREFERENCES(accountId);
      this.preferences.set(accountId, p);
    }
    return p;
  }

  ensurePaper(accountId: string): PaperState {
    let s = this.paper.get(accountId);
    if (!s) {
      s = freshPaperState(accountId);
      this.paper.set(accountId, s);
    }
    return s;
  }

  recordPrice(symbol: string, price: number): void {
    if (!Number.isFinite(price)) return;
    const now = Date.now();
    const arr = this.priceHistory.get(symbol) ?? [];
    arr.push({ ts: now, price });
    const cutoff = now - 24 * 60 * 60 * 1000;
    while (arr.length && arr[0].ts < cutoff) arr.shift();
    this.priceHistory.set(symbol, arr);
  }

  priceAgoMinutes(symbol: string, windowMinutes: number): number | undefined {
    const arr = this.priceHistory.get(symbol);
    if (!arr || arr.length === 0) return undefined;
    const target = Date.now() - windowMinutes * 60_000;
    let lo = 0;
    let hi = arr.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid].ts < target) lo = mid + 1;
      else hi = mid;
    }
    return arr[lo]?.price;
  }
}

const globalForStore = globalThis as unknown as { __xakeStore?: MemoryStore };
export const store = globalForStore.__xakeStore ?? new MemoryStore();
if (!globalForStore.__xakeStore) globalForStore.__xakeStore = store;
