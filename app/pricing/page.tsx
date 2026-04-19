import Link from "next/link";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Sandbox",
    price: "$0",
    body: "Full cockpit on mock data. Paper trading, alerts, Claude co-pilot (with your own key).",
    cta: "Open cockpit",
    href: "/app",
  },
  {
    name: "Operator",
    price: "TBD",
    body: "Reserved for when licensed realtime data lands. Account, preferences, persistent history.",
    cta: "Notify me",
    href: "mailto:hello@xake.dev",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/" className="mb-6 inline-block text-xs text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
      <h1 className="font-mono text-3xl font-bold">Pricing</h1>
      <p className="mt-2 text-muted-foreground">Honest pricing for an honest product.</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {tiers.map((t) => (
          <div key={t.name} className="rounded-md border border-border bg-surface p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.name}</div>
            <div className="mt-2 font-mono text-3xl">{t.price}</div>
            <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
            <div className="mt-5">
              <Button asChild variant="outline">
                <Link href={t.href}>{t.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
