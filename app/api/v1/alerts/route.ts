import { NextResponse } from "next/server";
import { currentAccountId } from "@/lib/auth/current-user";
import { AlertDraftSchema, newAlert } from "@/lib/alerts/engine";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const accountId = await currentAccountId();
  const mine = [...store.alerts.values()].filter((a) => a.accountId === accountId);
  const firings = store.firings
    .filter((f) => mine.some((a) => a.id === f.alertId))
    .slice(-50)
    .reverse();
  return NextResponse.json({ alerts: mine, firings });
}

export async function POST(req: Request) {
  const accountId = await currentAccountId();
  const body = await req.json().catch(() => null);
  const parsed = AlertDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const hashCheck = [...store.alerts.values()].find(
    (a) => a.accountId === accountId && JSON.stringify(a.condition) === JSON.stringify(parsed.data.condition),
  );
  if (hashCheck) {
    return NextResponse.json({ error: "duplicate_condition", alert: hashCheck }, { status: 409 });
  }
  const alert = newAlert(accountId, parsed.data);
  store.alerts.set(alert.id, alert);
  return NextResponse.json({ alert }, { status: 201 });
}

export async function DELETE(req: Request) {
  const accountId = await currentAccountId();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const a = store.alerts.get(id);
  if (!a || a.accountId !== accountId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  store.alerts.delete(id);
  return NextResponse.json({ ok: true });
}
