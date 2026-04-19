import { z } from "zod";
import { createHash } from "crypto";
import { uid } from "@/lib/utils";
import type { Quote } from "@/lib/data-core/types";

export const AlertConditionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("price"),
    symbol: z.string(),
    op: z.enum(["gt", "lt"]),
    value: z.number(),
  }),
  z.object({
    kind: z.literal("percent_move"),
    symbol: z.string(),
    windowMinutes: z.number().int().positive().max(1440),
    thresholdPct: z.number(),
  }),
]);
export type AlertCondition = z.infer<typeof AlertConditionSchema>;

export const AlertDraftSchema = z.object({
  name: z.string().min(1).max(80),
  condition: AlertConditionSchema,
  cooldownMinutes: z.number().int().nonnegative().default(5),
  note: z.string().max(400).optional(),
});
export type AlertDraft = z.infer<typeof AlertDraftSchema>;

export interface Alert extends AlertDraft {
  id: string;
  accountId: string;
  conditionHash: string;
  createdAt: number;
  lastFiredAt?: number;
  firedCount: number;
  enabled: boolean;
}

export interface AlertFiring {
  id: string;
  alertId: string;
  firedAt: number;
  reason: string;
  context: Record<string, number | string>;
}

export function hashCondition(c: AlertCondition): string {
  return createHash("sha1").update(JSON.stringify(c)).digest("hex");
}

export function newAlert(accountId: string, draft: AlertDraft): Alert {
  return {
    ...draft,
    id: uid("alrt"),
    accountId,
    conditionHash: hashCondition(draft.condition),
    createdAt: Date.now(),
    firedCount: 0,
    enabled: true,
  };
}

export function evaluate(
  alerts: Alert[],
  quoteFor: (symbol: string) => Quote | undefined,
  historyFor: (symbol: string, windowMinutes: number) => number | undefined,
): AlertFiring[] {
  const out: AlertFiring[] = [];
  const now = Date.now();

  for (const a of alerts) {
    if (!a.enabled) continue;
    if (a.lastFiredAt && now - a.lastFiredAt < a.cooldownMinutes * 60_000) continue;

    const c = a.condition;
    if (c.kind === "price") {
      const q = quoteFor(c.symbol);
      if (!q) continue;
      const triggered = c.op === "gt" ? q.last > c.value : q.last < c.value;
      if (triggered) {
        out.push({
          id: uid("fire"),
          alertId: a.id,
          firedAt: now,
          reason: `${c.symbol} ${c.op === "gt" ? ">" : "<"} ${c.value}`,
          context: { last: q.last, threshold: c.value },
        });
        a.lastFiredAt = now;
        a.firedCount += 1;
      }
    } else if (c.kind === "percent_move") {
      const q = quoteFor(c.symbol);
      const past = historyFor(c.symbol, c.windowMinutes);
      if (!q || past === undefined || past === 0) continue;
      const pct = ((q.last - past) / past) * 100;
      const triggered = c.thresholdPct >= 0 ? pct >= c.thresholdPct : pct <= c.thresholdPct;
      if (triggered) {
        out.push({
          id: uid("fire"),
          alertId: a.id,
          firedAt: now,
          reason: `${c.symbol} ${pct.toFixed(2)}% over ${c.windowMinutes}m`,
          context: { pct, last: q.last, past },
        });
        a.lastFiredAt = now;
        a.firedCount += 1;
      }
    }
  }

  return out;
}
