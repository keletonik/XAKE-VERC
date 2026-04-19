import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-center p-8 text-muted-foreground", className)}>
      {icon && <div className="opacity-60">{icon}</div>}
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description && <div className="text-xs max-w-sm">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
