import { NextResponse } from "next/server";
import { currentAccountId } from "@/lib/auth/current-user";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { snapshot, freshPaperState } from "@/lib/trading-core/paper-engine";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const accountId = await currentAccountId();
  const state = store.ensurePaper(accountId);
  const provider = getMarketProvider();
  const snap = snapshot(state, (s) => provider.getQuote(s));
  return NextResponse.json({ portfolio: snap });
}

export async function DELETE() {
  const accountId = await currentAccountId();
  const prefs = store.ensurePrefs(accountId);
  store.paper.set(accountId, freshPaperState(accountId, prefs.paperStartingCash));
  return NextResponse.json({ ok: true });
}
