"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDateTime } from "@/lib/format";

export type ThreadMessage = { id: number; body: string; authorName: string; authorRole: string; createdAt: string };

export default function Thread({
  initial,
  me,
  userId,
  emptyLine,
}: {
  initial: ThreadMessage[];
  me: string;
  /** Admins pass the client's id; clients leave it undefined. */
  userId?: number;
  emptyLine: string;
}) {
  const [items, setItems] = useState<ThreadMessage[]>(initial);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Clear the unread badge for whichever side is reading.
  useEffect(() => {
    fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [items.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text, userId }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not send that.");
    setBody("");
    setItems(
      (data.messages as { id: number; body: string; author_name: string; author_role: string; created_at: string }[]).map((m) => ({
        id: m.id,
        body: m.body,
        authorName: m.author_name,
        authorRole: m.author_role,
        createdAt: m.created_at,
      }))
    );
  }

  return (
    <div className="card flex flex-col" style={{ minHeight: "min(62vh, 560px)" }}>
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: "min(62vh, 560px)" }}>
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center px-6 py-10">
            <p className="text-sm text-[var(--muted)] max-w-xs leading-relaxed">{emptyLine}</p>
          </div>
        ) : (
          items.map((m) => {
            const mine = m.authorRole === me;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div className={`bubble ${mine ? "bubble-me" : "bubble-them"}`}>{m.body}</div>
                <p className="mono mt-1.5 px-1">
                  {mine ? "You" : m.authorName} · {fmtDateTime(m.createdAt)}
                </p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="p-4 border-t border-[var(--border)]">
        {error && <p className="text-sm text-[var(--danger)] mb-2">{error}</p>}
        <div className="flex items-end gap-2.5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(e);
            }}
            placeholder="Write a message…"
            rows={2}
            className="input flex-1"
            style={{ minHeight: 44, resize: "none" }}
          />
          <button type="submit" disabled={busy || !body.trim()} className="btn btn-primary shrink-0">
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
        <p className="help">⌘ + Enter sends.</p>
      </form>
    </div>
  );
}
