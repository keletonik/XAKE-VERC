import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getMarketProvider } from "@/lib/data-core/mock-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = env();
  const provider = getMarketProvider();
  const sample = provider.getQuote("BTC-USD");

  return NextResponse.json({
    ok: true,
    env: cfg.NEXT_PUBLIC_ENVIRONMENT,
    version: "1.0.0",
    feed: {
      provider: provider.name,
      feedClass: provider.feedClass,
      ageMs: sample ? Date.now() - sample.ts : null,
    },
    ai: {
      configured: Boolean(cfg.ANTHROPIC_API_KEY),
      model: cfg.ANTHROPIC_MODEL,
    },
    now: Date.now(),
  });
}
