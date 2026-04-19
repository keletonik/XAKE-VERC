import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-6 inline-block text-xs text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
      <h1 className="font-mono text-3xl font-bold">Security posture</h1>
      <p className="mt-2 text-muted-foreground">
        XAKE is deliberately scoped to a paper-only environment while the licensing and partner
        pieces required for live execution are not in place.
      </p>

      <ul className="mt-8 space-y-4 text-sm">
        <li>
          <strong className="block">No live money.</strong>
          <span className="text-muted-foreground">
            There is no execution path to a real broker. The paper engine is the only engine.
          </span>
        </li>
        <li>
          <strong className="block">Secrets stay server-side.</strong>
          <span className="text-muted-foreground">
            Provider and model credentials are read only inside Next.js Route Handlers.
          </span>
        </li>
        <li>
          <strong className="block">Cron is authenticated.</strong>
          <span className="text-muted-foreground">
            Vercel Cron requests must present <code className="font-mono">Bearer $CRON_SECRET</code>
            {" "}in production — unauthenticated requests are rejected.
          </span>
        </li>
        <li>
          <strong className="block">AI does not execute.</strong>
          <span className="text-muted-foreground">
            Claude can analyse, explain, screen, and draft. It never places orders or creates alerts by itself.
          </span>
        </li>
        <li>
          <strong className="block">Input validation at every boundary.</strong>
          <span className="text-muted-foreground">
            Zod schemas validate env, API bodies, and AI-produced structured outputs.
          </span>
        </li>
      </ul>
    </div>
  );
}
