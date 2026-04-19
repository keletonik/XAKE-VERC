import { PaperTicket } from "@/components/paper-ticket";

export const dynamic = "force-dynamic";

export default function PaperPage() {
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4 scrollbar-thin">
      <PaperTicket />
    </div>
  );
}
