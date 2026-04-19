"use client";

import * as React from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Panel } from "./ui/panel";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function AssistantPanel() {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`assistant_error_${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const eventLine = frame.match(/^event: (.+)$/m)?.[1];
          const dataLine = frame.match(/^data: (.+)$/m)?.[1];
          if (!eventLine || !dataLine) continue;
          try {
            const payload = JSON.parse(dataLine) as { data: string };
            if (eventLine === "token") {
              setMessages((m) => {
                const next = [...m];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + payload.data };
                }
                return next;
              });
            } else if (eventLine === "error") {
              setMessages((m) => {
                const next = [...m];
                next[next.length - 1] = { role: "assistant", content: `Error: ${payload.data}` };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "unknown"}`,
        };
        return next;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="size-3 text-primary" /> Assistant
        </span>
      }
      className="h-full"
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto scrollbar-thin p-3">
          {messages.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              Ask about a symbol, screen instruments, or request a paper order draft.
              <br />
              The assistant never executes; humans confirm.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "mb-3 rounded-md border p-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-surface-elevated",
              )}
            >
              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.role}
              </div>
              <div className="whitespace-pre-wrap break-words">
                {m.content || (m.role === "assistant" && streaming ? "…" : "")}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="flex items-end gap-2 border-t border-border p-2" onSubmit={send}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Message the assistant…"
            className="flex-1 resize-none rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button type="submit" disabled={streaming || !input.trim()} size="icon">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </Panel>
  );
}
