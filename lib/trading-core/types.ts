import { z } from "zod";

export const SideEnum = z.enum(["buy", "sell"]);
export type Side = z.infer<typeof SideEnum>;

export const OrderTypeEnum = z.enum(["market", "limit"]);
export type OrderType = z.infer<typeof OrderTypeEnum>;

export const TifEnum = z.enum(["gtc", "ioc", "fok", "day"]);
export type Tif = z.infer<typeof TifEnum>;

export const OrderStatusEnum = z.enum([
  "draft",
  "accepted",
  "working",
  "filled",
  "partially_filled",
  "cancelled",
  "rejected",
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const OrderDraftSchema = z.object({
  symbol: z.string().min(1),
  side: SideEnum,
  type: OrderTypeEnum,
  qty: z.number().positive(),
  limitPrice: z.number().positive().optional(),
  tif: TifEnum.default("gtc"),
  clientId: z.string().optional(),
});
export type OrderDraft = z.infer<typeof OrderDraftSchema>;

export interface Order extends OrderDraft {
  id: string;
  accountId: string;
  status: OrderStatus;
  filledQty: number;
  avgFillPrice: number;
  createdAt: number;
  updatedAt: number;
  environment: "paper" | "live";
  reason?: string;
}

export interface Fill {
  id: string;
  orderId: string;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  ts: number;
}

export interface Position {
  symbol: string;
  qty: number;
  avgCost: number;
  realisedPnl: number;
}

export interface PortfolioSnapshot {
  accountId: string;
  cash: number;
  equity: number;
  positions: Position[];
  realisedPnl: number;
  unrealisedPnl: number;
  updatedAt: number;
}
