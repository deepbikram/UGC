"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusChip, { DELIVERABLE_STATUSES, statusLabel } from "./StatusChip";
import { fmtDate } from "@/lib/format";

export type AdminDeliverable = {
  id: number;
  title: string;
  summary: string;
  kind: string;
  status: string;
  url: string;
  dueOn: string;
  createdAt: string;
  reviewNote?: string;
};

const KINDS = ["tiktok", "instagram", "youtube", "other"];

export default function AdminDeliverables({ userId, items }: { userId: number; items: AdminDeliverable[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(items.length === 0);
  const [draft, setDraft] = useState({ title: "", summary: "", kind: "tiktok", url: "", dueOn: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...draft }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error || "Could not add that.");
    }
    setDraft({ title: "", summary: "", kind: "tiktok", url: "", dueOn: "" });
    setAdding(false);
    router.refresh();
  }

  async function patch(id: number, patchBody: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/admin/deliverables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patchBody }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm("Delete this video? The creator loses sight of it immediately.")) return;
    setBusy(true);
    await fetch("/api/admin/deliverables", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[17px] font-semibold">Deliverables</h2>
          <p className="help">Moving something to “Your review” is what asks the creator to approve it.</p>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn btn-ghost btn-sm shrink-0">{adding ? "Cancel" : "+ Add"}</button>
      </div>

      {adding && (
        <form onSubmit={add} className="card-flat p-4 mb-5 rise-in">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="d-title">Title <span className="req">*</span></label>
              <input id="d-title" className="input" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Homepage concept — round one" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="d-summary">Summary</label>
              <textarea id="d-summary" className="input" style={{ minHeight: 70 }} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} placeholder="What it is and what you want them to look at." />
            </div>
            <div>
              <label className="label" htmlFor="d-kind">Type</label>
              <select id="d-kind" className="input" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="d-due">Due</label>
              <input id="d-due" type="date" className="input" value={draft.dueOn} onChange={(e) => setDraft({ ...draft, dueOn: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="d-url">Link</label>
              <input id="d-url" className="input" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://figma.com/… (optional)" />
            </div>
          </div>
          {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary btn-sm mt-4">{busy ? "Adding…" : "Add deliverable"}</button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nothing on this creator&apos;s board yet.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((d) => (
            <div key={d.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-[15px] font-semibold">{d.title}</h3>
                    <StatusChip status={d.status} />
                    <span className="mono">{d.kind}</span>
                  </div>
                  {d.summary && <p className="text-[13px] text-[var(--muted)] leading-relaxed">{d.summary}</p>}
                  {d.status === "rejected" && d.reviewNote && (
                    <p className="text-[13px] leading-relaxed mt-1.5" style={{ color: "var(--danger)" }}>
                      Rejection reason (visible to creator): {d.reviewNote}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {d.dueOn && <span className="mono">Due {fmtDate(d.dueOn)}</span>}
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline underline-offset-2" style={{ color: "var(--accent)" }}>
                        Open ↗
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="input btn-sm"
                    style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}
                    value={d.status}
                    disabled={busy}
                    onChange={(e) => patch(d.id, { status: e.target.value })}
                    aria-label={`Status for ${d.title}`}
                  >
                    {DELIVERABLE_STATUSES.map((st) => (
                      <option key={st} value={st}>{statusLabel(st)}</option>
                    ))}
                  </select>
                  <button onClick={() => setEditing(editing === d.id ? null : d.id)} className="btn btn-quiet btn-sm">Edit</button>
                  <button onClick={() => remove(d.id)} className="btn btn-quiet btn-sm" style={{ color: "var(--danger)" }}>Delete</button>
                </div>
              </div>

              {editing === d.id && (
                <EditRow deliverable={d} onSave={(patchBody) => { setEditing(null); patch(d.id, patchBody); }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditRow({ deliverable, onSave }: { deliverable: AdminDeliverable; onSave: (patch: Record<string, unknown>) => void }) {
  const [v, setV] = useState({ title: deliverable.title, summary: deliverable.summary, url: deliverable.url, dueOn: deliverable.dueOn });
  return (
    <div className="mt-4 pt-4 hairline grid sm:grid-cols-2 gap-3.5 rise-in">
      <div className="sm:col-span-2">
        <label className="label">Title</label>
        <input className="input" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Summary</label>
        <textarea className="input" style={{ minHeight: 70 }} value={v.summary} onChange={(e) => setV({ ...v, summary: e.target.value })} />
      </div>
      <div>
        <label className="label">Link</label>
        <input className="input" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} />
      </div>
      <div>
        <label className="label">Due</label>
        <input type="date" className="input" value={v.dueOn} onChange={(e) => setV({ ...v, dueOn: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <button onClick={() => onSave(v)} className="btn btn-primary btn-sm">Save changes</button>
      </div>
    </div>
  );
}
