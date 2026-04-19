import { getMarketProvider } from "@/lib/data-core/mock-provider";
import { store } from "@/lib/store/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbolsParam = url.searchParams.get("symbols") ?? "BTC-USD";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const provider = getMarketProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      for (const s of symbols) {
        const q = provider.getQuote(s);
        if (q) {
          store.recordPrice(q.symbol, q.last);
          send("quote", q);
        }
      }

      const unsub = provider.subscribe(symbols, (q) => {
        store.recordPrice(q.symbol, q.last);
        try {
          send("quote", q);
        } catch {}
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15_000);

      const onAbort = () => {
        clearInterval(heartbeat);
        try { unsub(); } catch {}
        try { controller.close(); } catch {}
      };

      req.signal.addEventListener("abort", onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
