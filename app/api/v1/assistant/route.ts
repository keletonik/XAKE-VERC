import { z } from "zod";
import { streamAssistant, type AssistantMessage } from "@/lib/ai/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(8_000),
    }),
  ),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const history: AssistantMessage[] = parsed.data.messages;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify({ data })}\n\n`),
        );
      };

      try {
        for await (const ev of streamAssistant(history)) {
          if (req.signal.aborted) break;
          send(ev.type, ev.data);
        }
      } catch (err) {
        send("error", err instanceof Error ? err.message : String(err));
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
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
