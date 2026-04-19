import { NextResponse } from "next/server";
import { getMarketProvider } from "@/lib/data-core/mock-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const p = getMarketProvider();
  const items = p.listInstruments().map((i) => ({
    instrument: i,
    quote: p.getQuote(i.symbol),
  }));
  return NextResponse.json({ items });
}
