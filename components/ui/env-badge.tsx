import { Badge } from "./badge";

export function EnvBadge({ environment }: { environment: "paper" | "live" }) {
  if (environment === "live") {
    return (
      <Badge variant="destructive" className="font-mono uppercase tracking-wider">
        LIVE
      </Badge>
    );
  }
  return (
    <Badge variant="paper" className="font-mono uppercase tracking-wider">
      PAPER
    </Badge>
  );
}
