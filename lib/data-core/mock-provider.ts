import type {
  Candle,
  Instrument,
  MarketDataProvider,
  Quote,
  Timeframe,
} from "./types";
import { timeframeSeconds } from "./types";

const CATALOGUE: ReadonlyArray<Instrument & { seed: number; vol: number }> = [
  { symbol: "BTC-USD", displayName: "Bitcoin / USD", assetClass: "crypto", venue: "MOCK", tickSize: 0.01, lotSize: 0.0001, seed: 62000, vol: 0.012 },
  { symbol: "ETH-USD", displayName: "Ethereum / USD", assetClass: "crypto", venue: "MOCK", tickSize: 0.01, lotSize: 0.001, seed: 3100, vol: 0.014 },
  { symbol: "SOL-USD", displayName: "Solana / USD", assetClass: "crypto", venue: "MOCK", tickSize: 0.01, lotSize: 0.01, seed: 142, vol: 0.022 },
  { symbol: "AAPL", displayName: "Apple Inc.", assetClass: "equity", venue: "MOCK", tickSize: 0.01, lotSize: 1, seed: 229, vol: 0.008 },
  { symbol: "MSFT", displayName: "Microsoft Corp.", assetClass: "equity", venue: "MOCK", tickSize: 0.01, lotSize: 1, seed: 416, vol: 0.007 },
  { symbol: "NVDA", displayName: "NVIDIA Corp.", assetClass: "equity", venue: "MOCK", tickSize: 0.01, lotSize: 1, seed: 118, vol: 0.018 },
  { symbol: "SPY", displayName: "SPDR S&P 500 ETF", assetClass: "index", venue: "MOCK", tickSize: 0.01, lotSize: 1, seed: 547, vol: 0.006 },
  { symbol: "EUR-USD", displayName: "EUR / USD", assetClass: "fx", venue: "MOCK", tickSize: 0.0001, lotSize: 1000, seed: 1.078, vol: 0.003 },
];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function driftedPrice(seedPrice: number, vol: number, tMinutes: number, rand: () => number): number {
  const drift = Math.sin(tMinutes / 37) * 0.02 + (rand() - 0.5) * vol;
  const price = seedPrice * (1 + drift + Math.cos(tMinutes / 91) * 0.01);
  const low = seedPrice * 0.75;
  const high = seedPrice * 1.25;
  return Math.max(low, Math.min(high, price));
}

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = "mock";
  readonly feedClass = "mock" as const;
  private subs = new Map<string, Set<(q: Quote) => void>>();
  private timer: ReturnType<typeof setInterval> | undefined;

  listInstruments(): Instrument[] {
    return CATALOGUE.map((entry) => {
      const { symbol, displayName, assetClass, venue, tickSize, lotSize } = entry;
      return { symbol, displayName, assetClass, venue, tickSize, lotSize };
    });
  }

  getQuote(symbol: string): Quote | undefined {
    const inst = CATALOGUE.find((i) => i.symbol === symbol);
    if (!inst) return undefined;
    const now = Date.now();
    const tMin = now / 60_000;
    const rand = mulberry32(Math.floor(tMin) + hashSymbol(symbol));
    const mid = driftedPrice(inst.seed, inst.vol, tMin, rand);
    const halfSpread = mid * 0.0005;
    return {
      symbol,
      bid: round(mid - halfSpread, inst.tickSize),
      ask: round(mid + halfSpread, inst.tickSize),
      last: round(mid, inst.tickSize),
      ts: now,
      receivedAt: now,
      source: this.name,
      feedClass: this.feedClass,
      ageMs: 0,
    };
  }

  getCandles(symbol: string, tf: Timeframe, limit: number): Candle[] {
    const inst = CATALOGUE.find((i) => i.symbol === symbol);
    if (!inst) return [];
    const step = timeframeSeconds[tf] * 1000;
    const now = Date.now();
    const end = Math.floor(now / step) * step;
    const out: Candle[] = [];
    for (let i = limit - 1; i >= 0; i--) {
      const t = end - i * step;
      const rand = mulberry32(Math.floor(t / step) + hashSymbol(symbol));
      const open = driftedPrice(inst.seed, inst.vol, t / 60_000, rand);
      const close = driftedPrice(inst.seed, inst.vol, (t + step) / 60_000, rand);
      const high = Math.max(open, close) * (1 + rand() * inst.vol * 0.5);
      const low = Math.min(open, close) * (1 - rand() * inst.vol * 0.5);
      out.push({
        symbol,
        time: Math.floor(t / 1000),
        open: round(open, inst.tickSize),
        high: round(high, inst.tickSize),
        low: round(low, inst.tickSize),
        close: round(close, inst.tickSize),
        volume: Math.round(rand() * 5_000_000),
      });
    }
    return out;
  }

  subscribe(symbols: string[], onTick: (q: Quote) => void): () => void {
    for (const s of symbols) {
      if (!this.subs.has(s)) this.subs.set(s, new Set());
      this.subs.get(s)!.add(onTick);
    }
    this.ensureLoop();
    return () => {
      for (const s of symbols) this.subs.get(s)?.delete(onTick);
      if ([...this.subs.values()].every((v) => v.size === 0)) this.stopLoop();
    };
  }

  private ensureLoop() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      for (const [sym, handlers] of this.subs) {
        if (handlers.size === 0) continue;
        const q = this.getQuote(sym);
        if (!q) continue;
        for (const h of handlers) {
          try { h(q); } catch {}
        }
      }
    }, 1000);
  }

  private stopLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}

function round(value: number, tick: number): number {
  return Math.round(value / tick) * tick;
}

function hashSymbol(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 10_000;
}

let singleton: MockMarketDataProvider | undefined;
export function getMarketProvider(): MarketDataProvider {
  if (!singleton) singleton = new MockMarketDataProvider();
  return singleton;
}
