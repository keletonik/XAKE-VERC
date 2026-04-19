import { uid } from "@/lib/utils";
import type { Quote } from "@/lib/data-core/types";
import type {
  Fill,
  Order,
  OrderDraft,
  PortfolioSnapshot,
  Position,
} from "./types";

export interface PaperState {
  accountId: string;
  cash: number;
  positions: Map<string, Position>;
  orders: Map<string, Order>;
  fills: Fill[];
  realisedPnl: number;
  updatedAt: number;
}

export function freshPaperState(accountId: string, startingCash = 100_000): PaperState {
  return {
    accountId,
    cash: startingCash,
    positions: new Map(),
    orders: new Map(),
    fills: [],
    realisedPnl: 0,
    updatedAt: Date.now(),
  };
}

export interface PlaceResult {
  ok: boolean;
  order: Order;
  fills: Fill[];
  reason?: string;
}

const SLIPPAGE_BPS = 2;

export function placeOrder(
  state: PaperState,
  draft: OrderDraft,
  quote: Quote | undefined,
): PlaceResult {
  const now = Date.now();
  const order: Order = {
    ...draft,
    id: uid("ord"),
    accountId: state.accountId,
    status: "accepted",
    filledQty: 0,
    avgFillPrice: 0,
    createdAt: now,
    updatedAt: now,
    environment: "paper",
  };

  if (draft.side === "sell") {
    const pos = state.positions.get(draft.symbol);
    const have = pos?.qty ?? 0;
    if (have < draft.qty) {
      order.status = "rejected";
      order.reason = "short_selling_blocked";
      state.orders.set(order.id, order);
      return { ok: false, order, fills: [], reason: order.reason };
    }
  }

  if (!quote) {
    order.status = "rejected";
    order.reason = "no_quote";
    state.orders.set(order.id, order);
    return { ok: false, order, fills: [], reason: order.reason };
  }

  const refPrice = draft.side === "buy" ? quote.ask : quote.bid;

  if (draft.type === "market") {
    const slip = refPrice * (SLIPPAGE_BPS / 10_000) * (draft.side === "buy" ? 1 : -1);
    const fillPrice = refPrice + slip;
    return settleFill(state, order, fillPrice, draft.qty);
  }

  if (!draft.limitPrice) {
    order.status = "rejected";
    order.reason = "missing_limit_price";
    state.orders.set(order.id, order);
    return { ok: false, order, fills: [], reason: order.reason };
  }

  const crosses = draft.side === "buy" ? quote.ask <= draft.limitPrice : quote.bid >= draft.limitPrice;

  if (crosses) {
    return settleFill(state, order, draft.limitPrice, draft.qty);
  }

  if (draft.tif === "ioc" || draft.tif === "fok") {
    order.status = "cancelled";
    order.reason = "no_cross";
    state.orders.set(order.id, order);
    return { ok: false, order, fills: [], reason: order.reason };
  }

  order.status = "working";
  state.orders.set(order.id, order);
  return { ok: true, order, fills: [] };
}

function settleFill(
  state: PaperState,
  order: Order,
  price: number,
  qty: number,
): PlaceResult {
  const notional = price * qty;
  if (order.side === "buy" && state.cash < notional) {
    order.status = "rejected";
    order.reason = "insufficient_buying_power";
    state.orders.set(order.id, order);
    return { ok: false, order, fills: [], reason: order.reason };
  }

  const fill: Fill = {
    id: uid("fill"),
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    qty,
    price,
    ts: Date.now(),
  };

  applyFillToPositions(state, fill);

  order.status = "filled";
  order.filledQty = qty;
  order.avgFillPrice = price;
  order.updatedAt = Date.now();
  state.orders.set(order.id, order);
  state.fills.push(fill);
  state.updatedAt = order.updatedAt;

  return { ok: true, order, fills: [fill] };
}

function applyFillToPositions(state: PaperState, fill: Fill): void {
  const existing = state.positions.get(fill.symbol);
  if (fill.side === "buy") {
    state.cash -= fill.price * fill.qty;
    if (!existing) {
      state.positions.set(fill.symbol, { symbol: fill.symbol, qty: fill.qty, avgCost: fill.price, realisedPnl: 0 });
    } else {
      const totalQty = existing.qty + fill.qty;
      existing.avgCost = (existing.avgCost * existing.qty + fill.price * fill.qty) / totalQty;
      existing.qty = totalQty;
    }
  } else {
    state.cash += fill.price * fill.qty;
    if (existing) {
      const realised = (fill.price - existing.avgCost) * fill.qty;
      existing.realisedPnl += realised;
      state.realisedPnl += realised;
      existing.qty -= fill.qty;
      if (existing.qty <= 1e-9) state.positions.delete(fill.symbol);
    }
  }
}

export function resolveWorkingOrders(
  state: PaperState,
  quoteFor: (symbol: string) => Quote | undefined,
): Fill[] {
  const producedFills: Fill[] = [];
  for (const order of state.orders.values()) {
    if (order.status !== "working" || order.type !== "limit" || !order.limitPrice) continue;
    const q = quoteFor(order.symbol);
    if (!q) continue;
    const crosses = order.side === "buy" ? q.ask <= order.limitPrice : q.bid >= order.limitPrice;
    if (!crosses) continue;
    const result = settleFill(state, order, order.limitPrice, order.qty - order.filledQty);
    producedFills.push(...result.fills);
  }
  return producedFills;
}

export function snapshot(
  state: PaperState,
  quoteFor: (symbol: string) => Quote | undefined,
): PortfolioSnapshot {
  const positions = [...state.positions.values()];
  let unrealised = 0;
  let positionsValue = 0;
  for (const p of positions) {
    const q = quoteFor(p.symbol);
    const mark = q?.last ?? p.avgCost;
    positionsValue += mark * p.qty;
    unrealised += (mark - p.avgCost) * p.qty;
  }
  return {
    accountId: state.accountId,
    cash: state.cash,
    equity: state.cash + positionsValue,
    positions,
    realisedPnl: state.realisedPnl,
    unrealisedPnl: unrealised,
    updatedAt: state.updatedAt,
  };
}
