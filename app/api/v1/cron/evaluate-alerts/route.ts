import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { evaluate } from "@/lib/alerts/engine";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(req: Request): boolean {
  const secret = env().CRON_SECRET;
  if (!secret) return true;
  const bearer = req.headers.get("authorization");
  return bearer === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const provider = getMarketProvider();
  const alerts = [...store.alerts.values()];

  for (const a of alerts) {
    const q = provider.getQuote(a.condition.symbol);
    if (q) store.recordPrice(a.condition.symbol, q.last);
  }

  const firings = evaluate(
    alerts,
    (s) => provider.getQuote(s),
    (s, mins) => store.priceAgoMinutes(s, mins),
  );
  store.firings.push(...firings);

  return NextResponse.json({
    ok: true,
    evaluated: alerts.length,
    fired: firings.length,
    firings,
    at: Date.now(),
  });
}
