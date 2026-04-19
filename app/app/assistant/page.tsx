import { AssistantPanel } from "@/components/assistant-panel";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <AssistantPanel />
    </div>
  );
}
