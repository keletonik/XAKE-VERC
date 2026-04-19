import { NextResponse } from "next/server";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { timeframeSeconds, type Timeframe } from "@/lib/data-core/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TF_SET = new Set(Object.keys(timeframeSeconds));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");
  const tf = (url.searchParams.get("tf") ?? "15m") as Timeframe;
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") ?? 120)));

  if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });
  if (!TF_SET.has(tf)) return NextResponse.json({ error: "bad tf" }, { status: 400 });

  const candles = getMarketProvider().getCandles(symbol, tf, limit);
  return NextResponse.json({ symbol, tf, candles });
}
