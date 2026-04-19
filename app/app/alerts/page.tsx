import { AlertManager } from "@/components/alert-manager";

export const dynamic = "force-dynamic";

export default function AlertsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4 scrollbar-thin">
      <AlertManager />
    </div>
  );
}
