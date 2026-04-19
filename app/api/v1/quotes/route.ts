import { NextResponse } from "next/server";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbolsParam = url.searchParams.get("symbols") ?? "";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const provider = getMarketProvider();
  const quotes = symbols
    .map((s) => provider.getQuote(s))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  for (const q of quotes) store.recordPrice(q.symbol, q.last);

  return NextResponse.json({ quotes });
}
