import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/config/env";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the XAKE assistant — a senior market analyst inside a disciplined, paper-trading cockpit.

Rules:
- You never place orders or create alerts yourself. You can suggest drafts; humans confirm in the UI.
- Be concise. Favour short, scannable paragraphs and small tables over long prose.
- Acknowledge uncertainty when feed quality is low.
- Operate strictly in the paper environment. Never pretend to execute live trades.`;

export type AssistantEvent =
  | { type: "token"; data: string }
  | { type: "done"; data: string }
  | { type: "error"; data: string };

export async function* streamAssistant(
  history: AssistantMessage[],
): AsyncGenerator<AssistantEvent> {
  const cfg = env();
  if (!cfg.ANTHROPIC_API_KEY) {
    yield* stubStream(history);
    return;
  }

  const client = new Anthropic({ apiKey: cfg.ANTHROPIC_API_KEY });

  try {
    const stream = client.messages.stream({
      model: cfg.ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield { type: "token", data: event.delta.text };
      }
    }

    yield { type: "done", data: "" };
  } catch {
    try {
      const stream = client.messages.stream({
        model: cfg.ANTHROPIC_FALLBACK_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield { type: "token", data: event.delta.text };
        }
      }
      yield { type: "done", data: "" };
    } catch (err2) {
      yield { type: "error", data: err2 instanceof Error ? err2.message : String(err2) };
    }
  }
}

async function* stubStream(history: AssistantMessage[]): AsyncGenerator<AssistantEvent> {
  const last = history[history.length - 1]?.content ?? "";
  const reply = `Assistant stub (no ANTHROPIC_API_KEY set).

I heard: "${last.slice(0, 240)}"

Set ANTHROPIC_API_KEY in your Vercel project env to enable real Claude answers.`;
  for (const ch of reply) {
    await new Promise((r) => setTimeout(r, 6));
    yield { type: "token", data: ch };
  }
  yield { type: "done", data: "" };
}
