import { WatchlistManager } from "@/components/watchlist-manager";

export const dynamic = "force-dynamic";

export default function WatchlistsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <WatchlistManager />
    </div>
  );
}
