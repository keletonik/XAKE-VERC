import { NextResponse } from "next/server";
import { z } from "zod";
import { currentAccountId } from "@/lib/auth/current-user";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PatchSchema = z
  .object({
    theme: z.enum(["dark", "darker", "light", "system"]).optional(),
    density: z.enum(["comfortable", "compact"]).optional(),
    defaultSymbol: z.string().optional(),
    defaultTimeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]).optional(),
    paperStartingCash: z.number().min(1_000).max(10_000_000).optional(),
    aiTemperature: z.number().min(0).max(1).optional(),
    aiDraftConfirm: z.boolean().optional(),
    notifyFiring: z.boolean().optional(),
  })
  .strict();

export async function GET() {
  const accountId = await currentAccountId();
  return NextResponse.json({ preferences: store.ensurePrefs(accountId) });
}

export async function PATCH(req: Request) {
  const accountId = await currentAccountId();
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const current = store.ensurePrefs(accountId);
  const next = { ...current, ...parsed.data };
  store.preferences.set(accountId, next);
  return NextResponse.json({ preferences: next });
}
