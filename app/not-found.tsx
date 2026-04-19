import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="font-mono text-sm text-muted-foreground">404</div>
      <h1 className="font-mono text-3xl font-bold">Nothing at this path.</h1>
      <p className="text-sm text-muted-foreground">
        Try the landing or jump into the workspace.
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild>
          <Link href="/app">Open cockpit</Link>
        </Button>
      </div>
    </div>
  );
}
