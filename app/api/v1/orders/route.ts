import { NextResponse } from "next/server";
import { currentAccountId } from "@/lib/auth/current-user";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { OrderDraftSchema } from "@/lib/trading-core/types";
import { placeOrder, resolveWorkingOrders } from "@/lib/trading-core/paper-engine";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const accountId = await currentAccountId();
  const state = store.ensurePaper(accountId);
  const orders = [...state.orders.values()].sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ orders, fills: state.fills.slice(-50).reverse() });
}

export async function POST(req: Request) {
  const accountId = await currentAccountId();
  const body = await req.json().catch(() => null);
  const parsed = OrderDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const state = store.ensurePaper(accountId);
  const provider = getMarketProvider();
  const quote = provider.getQuote(parsed.data.symbol);
  const result = placeOrder(state, parsed.data, quote);

  resolveWorkingOrders(state, (s) => provider.getQuote(s));

  return NextResponse.json(
    { ok: result.ok, order: result.order, fills: result.fills, reason: result.reason },
    { status: result.ok ? 201 : 422 },
  );
}
