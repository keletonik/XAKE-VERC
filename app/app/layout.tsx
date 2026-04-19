import { AppShell } from "@/components/app-shell";
import { env } from "@/lib/config/env";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AppShell environment={env().NEXT_PUBLIC_ENVIRONMENT}>{children}</AppShell>;
}
