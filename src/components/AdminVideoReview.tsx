"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusChip from "./StatusChip";
import { fmtDate, timeAgo } from "@/lib/format";

export type WorkRow = {
  id: number;
  title: string;
  status: string;
  due_on: string;
  url: string;
  kind: string;
  created_at: string;
  review_note: string;
  client_id: number;
  client: string;
  company: string;
};

const GROUPS = [
  { status: "review", title: "Awaiting review", blurb: "Submitted videos sitting with the team." },
  { status: "in_progress", title: "In progress", blurb: "Being worked on right now." },
  { status: "queued", title: "Submitted", blurb: "New submissions not yet reviewed." },
  { status: "approved", title: "Eligible", blurb: "Reviewed and counted as eligible." },
  { status: "rejected", title: "Rejected", blurb: "Sent back with a reason the creator can see." },
];

const PLATFORM: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};

export default function AdminVideoReview({ rows }: { rows: WorkRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [reason, setReason] = useState<Record<number, string>>({});
  const [error, setError] = useState<Record<number, string>>({});

  async function decide(id: number, status: "approved" | "rejected") {
    const note = (reason[id] ?? "").trim();
    if (status === "rejected" && !note) {
      setError((p) => ({ ...p, [id]: "Write the rejection reason first — the creator will see it." }));
      return;
    }
    setError((p) => ({ ...p, [id]: "" }));
    setBusy(id);
    const res = await fetch("/api/admin/deliverables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewNote: note }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError((p) => ({ ...p, [id]: data.error || "Could not save." }));
      return;
    }
    setOpen(null);
    router.refresh();
  }

  return (
    <div className="space-y-9">
      {GROUPS.map((g) => {
        const items = rows.filter((r) => r.status === g.status);
        if (items.length === 0) return null;
        return (
          <section key={g.status}>
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="eyebrow">{g.title}</h2>
              <span className="mono num">{items.length}</span>
            </div>
            <p className="help mb-3">{g.blurb}</p>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl">
                  <tbody>
                    {items.map((r) => (
                      <Fragment key={r.id}>
                        <tr
                          onClick={() => setOpen(open === r.id ? null : r.id)}
                          className="cursor-pointer"
                        >
                          <td className="max-w-[300px]">
                            <p className="font-medium truncate">{r.title}</p>
                            <span className="text-xs text-[var(--muted)]">
                              {r.client}{r.company ? ` · ${r.company}` : ""} · {PLATFORM[r.kind] ?? r.kind}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell text-[var(--muted)] whitespace-nowrap">{r.due_on ? fmtDate(r.due_on) : "—"}</td>
                          <td className="text-right"><StatusChip status={r.status} /></td>
                        </tr>
                        {open === r.id && (
                          <tr>
                            <td colSpan={3} style={{ background: "var(--panel-2)" }}>
                              <div className="py-1">
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                                  <div>
                                    <p className="eyebrow mb-1">Posted on</p>
                                    <p className="text-sm font-medium">{PLATFORM[r.kind] ?? (r.kind || "—")}</p>
                                  </div>
                                  <div>
                                    <p className="eyebrow mb-1">Submitted</p>
                                    <p className="text-sm">{r.created_at ? timeAgo(r.created_at) : "—"}</p>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <p className="eyebrow mb-1">Link provided</p>
                                    {r.url ? (
                                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline underline-offset-2 break-all" style={{ color: "var(--accent)" }}>
                                        {r.url} ↗
                                      </a>
                                    ) : (
                                      <p className="text-sm text-[var(--muted)]">No link provided.</p>
                                    )}
                                  </div>
                                </div>
                                {(r.status === "review" || r.status === "queued" || r.status === "in_progress") && (
                                  <div className="mb-4">
                                    <label className="label" htmlFor={`reason-${r.id}`}>
                                      Rejection reason <span className="req">*</span>
                                      <span className="help"> shown to the creator if you reject</span>
                                    </label>
                                    <textarea
                                      id={`reason-${r.id}`}
                                      className="input"
                                      style={{ minHeight: 64 }}
                                      placeholder="e.g. No call to action to visit Band9Prep in the video."
                                      value={reason[r.id] ?? r.review_note ?? ""}
                                      onChange={(e) => setReason((p) => ({ ...p, [r.id]: e.target.value }))}
                                    />
                                  </div>
                                )}
                                {r.status === "rejected" && r.review_note && (
                                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--danger)" }}>
                                    Rejection reason shown to creator: {r.review_note}
                                  </p>
                                )}
                                {error[r.id] && <p className="text-sm text-[var(--danger)] mb-3">{error[r.id]}</p>}
                                <div className="flex flex-wrap items-center gap-3">
                                  <Link
                                    href={`/admin/clients/${r.client_id}?tab=deliverables`}
                                    className="btn btn-quiet btn-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Open creator
                                  </Link>
                                  {(r.status === "review" || r.status === "queued" || r.status === "in_progress" || r.status === "rejected") && (
                                    <button
                                      onClick={() => decide(r.id, "approved")}
                                      disabled={busy === r.id}
                                      className="btn btn-sm font-semibold"
                                      style={{ background: "#2f9e5f", borderColor: "#2f9e5f", color: "#0b0f0c" }}
                                    >
                                      {busy === r.id ? "Saving…" : "✓ Approve"}
                                    </button>
                                  )}
                                  {(r.status === "review" || r.status === "queued" || r.status === "in_progress") && (
                                    <button
                                      onClick={() => decide(r.id, "rejected")}
                                      disabled={busy === r.id}
                                      className="btn btn-sm font-semibold"
                                      style={{ background: "transparent", borderColor: "#c0453e", color: "#e0807a" }}
                                    >
                                      {busy === r.id ? "Saving…" : "✕ Reject"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
