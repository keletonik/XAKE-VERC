"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

export function ResetButton() {
  const [pending, setPending] = React.useState(false);
  async function reset() {
    if (!confirm("Reset the paper account? This wipes positions, orders, and fills.")) return;
    setPending(true);
    try {
      await fetch("/api/v1/portfolio", { method: "DELETE" });
      window.location.reload();
    } finally {
      setPending(false);
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={reset} disabled={pending}>
      <RotateCcw className="size-3" /> {pending ? "Resetting…" : "Reset paper"}
    </Button>
  );
}
