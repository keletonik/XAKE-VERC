import Link from "next/link";

const entries = [
  {
    date: "2026-04-19",
    title: "XAKE-VERC 1.0.0",
    items: [
      "Rebuilt from scratch as a single Next.js App Router app.",
      "Pure Vercel deployment: SSE streams, Route Handlers, Vercel Cron for alert evaluation.",
      "Paper engine, watchlists, alerts, AI assistant with Claude Sonnet 4.6 + Haiku 4.5 fallback.",
      "Deterministic mock market data provider for reproducible demos.",
      "In-memory store survives warm serverless instances; preferences interface ready for Postgres.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-6 inline-block text-xs text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
      <h1 className="font-mono text-3xl font-bold">Changelog</h1>
      <div className="mt-8 space-y-6">
        {entries.map((e) => (
          <div key={e.date} className="rounded-md border border-border bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold">{e.title}</div>
              <div className="font-mono text-xs text-muted-foreground">{e.date}</div>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {e.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
