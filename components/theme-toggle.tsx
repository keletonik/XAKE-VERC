"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

const order = ["dark", "darker", "light", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? theme ?? "dark" : "dark";
  const idx = Math.max(0, order.indexOf(current as (typeof order)[number]));

  const next = () => setTheme(order[(idx + 1) % order.length]);

  const Icon = current === "light" ? Sun : current === "system" ? Monitor : Moon;

  return (
    <Button variant="ghost" size="icon" onClick={next} aria-label={`Theme: ${current}. Click to cycle.`} title={`Theme: ${current}`}>
      <Icon className="size-4" />
    </Button>
  );
}
