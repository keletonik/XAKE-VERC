import * as React from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
}

export function Panel({
  title,
  actions,
  children,
  className,
  contentClassName,
  ...props
}: PanelProps) {
  return (
    <section className={cn("panel flex min-h-0 flex-col", className)} {...props}>
      {(title || actions) && (
        <header className="flex items-center justify-between px-4 h-10 hairline">
          {title ? (
            <div className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{title}</div>
          ) : (
            <span />
          )}
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 min-h-0 overflow-auto scrollbar-thin", contentClassName)}>{children}</div>
    </section>
  );
}
