import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(req: Request): boolean {
  const secret = env().CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const provider = getMarketProvider();
  const checkedSymbols = ["BTC-USD", "ETH-USD", "AAPL", "SPY"];
  const quotes = checkedSymbols.map((s) => provider.getQuote(s)).filter(Boolean);
  for (const q of quotes) if (q) store.recordPrice(q.symbol, q.last);

  const FIRING_CAP = 500;
  if (store.firings.length > FIRING_CAP) {
    store.firings = store.firings.slice(-FIRING_CAP);
  }

  return NextResponse.json({
    ok: true,
    checked: quotes.length,
    firingsKept: store.firings.length,
    at: Date.now(),
  });
}
