import { z } from "zod";
import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { store } from "@/lib/store/memory";

export const tools = [
  {
    name: "get_quote",
    description: "Fetch the latest quote for a symbol.",
    input: z.object({ symbol: z.string() }),
    run: async ({ symbol }: { symbol: string }) => {
      const q = getMarketProvider().getQuote(symbol);
      if (!q) return { ok: false, error: `Unknown symbol ${symbol}` };
      return { ok: true, quote: q };
    },
  },
  {
    name: "list_watchlist",
    description: "List symbols in the user's primary watchlist.",
    input: z.object({}),
    run: async (_: unknown, accountId: string) => {
      const wl = store.ensureWatchlist(accountId);
      return { ok: true, watchlist: wl };
    },
  },
  {
    name: "screen_instruments",
    description: "Screen instruments by asset class and minimum last price. Returns up to 20.",
    input: z.object({
      assetClass: z.enum(["crypto", "equity", "fx", "future", "index"]).optional(),
      minLast: z.number().optional(),
    }),
    run: async (args: { assetClass?: string; minLast?: number }) => {
      const p = getMarketProvider();
      const rows = p
        .listInstruments()
        .filter((i) => (args.assetClass ? i.assetClass === args.assetClass : true))
        .map((i) => ({ instrument: i, quote: p.getQuote(i.symbol) }))
        .filter((r) => args.minLast === undefined || (r.quote?.last ?? 0) >= args.minLast)
        .slice(0, 20);
      return { ok: true, rows };
    },
  },
  {
    name: "draft_order",
    description: "Draft a paper order. This does NOT place it — the user must confirm in the UI.",
    input: z.object({
      symbol: z.string(),
      side: z.enum(["buy", "sell"]),
      type: z.enum(["market", "limit"]),
      qty: z.number().positive(),
      limitPrice: z.number().positive().optional(),
      rationale: z.string().min(1).max(400),
    }),
    run: async (args: Record<string, unknown>) => ({ ok: true, draft: args }),
  },
  {
    name: "draft_alert",
    description: "Draft an alert. This does NOT create it — the user must confirm in the UI.",
    input: z.object({
      name: z.string().min(1).max(80),
      symbol: z.string(),
      op: z.enum(["gt", "lt"]),
      value: z.number(),
      rationale: z.string().min(1).max(400),
    }),
    run: async (args: Record<string, unknown>) => ({ ok: true, draft: args }),
  },
  {
    name: "portfolio_summary",
    description: "Summarise the user's paper portfolio.",
    input: z.object({}),
    run: async (_: unknown, accountId: string) => {
      const state = store.ensurePaper(accountId);
      const provider = getMarketProvider();
      return {
        ok: true,
        summary: {
          cash: state.cash,
          positions: [...state.positions.values()].map((p) => ({
            ...p,
            last: provider.getQuote(p.symbol)?.last ?? p.avgCost,
          })),
          realisedPnl: state.realisedPnl,
        },
      };
    },
  },
] as const;

export type ToolName = (typeof tools)[number]["name"];

export function anthropicToolDefs() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: zodToJsonSchema(t.input),
  }));
}

function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = describe(value);
      if (!value.isOptional()) required.push(key);
    }
    return { type: "object", properties, required };
  }
  return { type: "object" };
}

function describe(schema: z.ZodTypeAny): Record<string, unknown> {
  let s = schema;
  while (s instanceof z.ZodOptional || s instanceof z.ZodDefault) {
    s = s._def.innerType;
  }
  if (s instanceof z.ZodString) return { type: "string" };
  if (s instanceof z.ZodNumber) return { type: "number" };
  if (s instanceof z.ZodBoolean) return { type: "boolean" };
  if (s instanceof z.ZodEnum) return { type: "string", enum: s.options };
  if (s instanceof z.ZodArray) return { type: "array", items: describe(s.element) };
  return { type: "string" };
}
