import { NextResponse } from "next/server";
import { z } from "zod";
import { currentAccountId } from "@/lib/auth/current-user";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const accountId = await currentAccountId();
  const wl = store.ensureWatchlist(accountId);
  return NextResponse.json({ watchlist: wl });
}

const PatchSchema = z.object({
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
  rename: z.string().min(1).max(80).optional(),
});

export async function PATCH(req: Request) {
  const accountId = await currentAccountId();
  const wl = store.ensureWatchlist(accountId);
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { add, remove, rename } = parsed.data;
  if (add?.length) {
    for (const s of add) if (!wl.symbols.includes(s)) wl.symbols.push(s);
  }
  if (remove?.length) {
    wl.symbols = wl.symbols.filter((s) => !remove.includes(s));
  }
  if (rename) wl.name = rename;
  wl.updatedAt = Date.now();
  return NextResponse.json({ watchlist: wl });
}
