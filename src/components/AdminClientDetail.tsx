"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmtBytes, fmtDate, fmtDateTime, timeAgo } from "@/lib/format";
import type { Form } from "@/lib/forms";
import AdminDeliverables, { type AdminDeliverable } from "./AdminDeliverables";
import Thread, { type ThreadMessage } from "./Thread";
import Uploader from "./Uploader";

type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  projectName: string;
  startsOn: string;
  status: string;
  mustReset: boolean;
  seenIntro: boolean;
  createdAt: string;
  lastSeenAt: string | null;
};

type Tab = "overview" | "journey" | "intake" | "deliverables" | "files" | "messages" | "notes";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "journey", label: "Journey" },
  { key: "intake", label: "Intake" },
  { key: "deliverables", label: "Deliverables" },
  { key: "files", label: "Files" },
  { key: "messages", label: "Messages" },
  { key: "notes", label: "Notes" },
];

export default function AdminClientDetail({
  initialTab,
  client,
  completed,
  journey,
  intake,
  checklists,
  deliverables,
  files,
  messages,
  notes,
  activity,
}: {
  initialTab?: string;
  client: Client;
  completed: string[];
  journey: { slug: string; title: string; steps: { id: string; title: string; type: string }[] }[];
  intake: { form: Form; data: Record<string, string | string[]>; status: string; submittedAt: string | null }[];
  checklists: { stepId: string; title: string; items: string[]; checked: boolean[] }[];
  deliverables: AdminDeliverable[];
  files: { id: number; name: string; size: number; createdAt: string; category: string; fromUs: boolean }[];
  messages: ThreadMessage[];
  notes: { id: number; body: string; authorName: string; createdAt: string }[];
  activity: { id: number; kind: string; summary: string; actorName: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(() => (TABS.some((t) => t.key === initialTab) ? (initialTab as Tab) : "overview"));
  const [done, setDone] = useState(new Set(completed));
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const totalSteps = journey.reduce((a, m) => a + m.steps.length, 0);
  const pct = totalSteps ? Math.round((done.size / totalSteps) * 100) : 0;

  async function toggleStep(stepId: string, value: boolean) {
    setBusy(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, done: value, userId: client.id }),
    });
    setBusy(false);
    setDone((prev) => {
      const next = new Set(prev);
      if (value) next.add(stepId);
      else next.delete(stepId);
      return next;
    });
    router.refresh();
  }

  async function clientAction(action: string) {
    if (action === "archive" && !confirm(`Archive ${client.name}? They will not be able to sign in.`)) return;
    setBusy(true);
    const res = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id, action }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data.password) setNewPassword(data.password);
    router.refresh();
  }

  async function destroy() {
    if (!confirm(`Delete ${client.name} and everything attached to them? This cannot be undone.`)) return;
    if (!confirm("Really delete? Forms, files, deliverables, and messages all go with them.")) return;
    setBusy(true);
    await fetch("/api/admin/clients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id }),
    });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto fade-up">
      <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-white transition-colors mb-5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        All creators
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-5 mb-7">
        <div className="min-w-0">
          <p className="eyebrow mb-2.5">{client.company || "Creator"}</p>
          <h1 className="text-[2rem] font-bold title-grad leading-tight">{client.name}</h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            {client.email}
            {client.projectName && ` · ${client.projectName}`}
            {client.status === "archived" && <span className="ml-2 chip chip-flat">Archived</span>}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right">
            <p className="text-[1.4rem] font-bold num leading-none">{pct}%</p>
            <p className="mono mt-1">{done.size}/{totalSteps} steps</p>
          </div>
        </div>
      </div>

      {newPassword && (
        <div className="card p-4 mb-6 rise-in" style={{ borderColor: "rgba(216,207,192,0.4)", background: "rgba(216,207,192,0.05)" }}>
          <p className="text-sm font-semibold mb-1">New one-time password</p>
          <p className="text-[13px] text-[var(--muted)] mb-3">Send this to {client.name}. It is shown once and replaces their old password.</p>
          <code className="card-flat inline-block px-3 py-2 text-sm">{newPassword}</code>
          <button onClick={() => { navigator.clipboard.writeText(newPassword); }} className="btn btn-quiet btn-sm ml-2">Copy</button>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto mb-7 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[13.5px] font-medium px-3.5 py-2.5 whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.key ? "text-white" : "text-[var(--muted)] hover:text-white border-transparent"
            }`}
            style={tab === t.key ? { borderColor: "var(--accent)" } : { borderColor: "transparent" }}
          >
            {t.label}
            {t.key === "deliverables" && deliverables.length > 0 && <span className="ml-2 mono num">{deliverables.length}</span>}
            {t.key === "files" && files.length > 0 && <span className="ml-2 mono num">{files.length}</span>}
            {t.key === "messages" && messages.length > 0 && <span className="ml-2 mono num">{messages.length}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
          <div className="space-y-5">
            <div className="card p-5">
              <p className="eyebrow mb-4">Progress</p>
              <div className="bar mb-5">
                <div className={`bar-fill ${pct === 100 ? "bar-fill-done" : ""}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="space-y-2.5">
                {journey.map((m, i) => {
                  const d = m.steps.filter((st) => done.has(st.id)).length;
                  return (
                    <div key={m.slug} className="flex items-center gap-3">
                      <span className="mono shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[13.5px] flex-1 min-w-0 truncate">{m.title}</span>
                      <div className="bar bar-thin w-24 shrink-0">
                        <div className={`bar-fill ${d === m.steps.length ? "bar-fill-done" : ""}`} style={{ width: `${m.steps.length ? (d / m.steps.length) * 100 : 0}%` }} />
                      </div>
                      <span className="mono num shrink-0 w-10 text-right">{d}/{m.steps.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow mb-4">Recent activity</p>
              {activity.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Nothing recorded yet.</p>
              ) : (
                <ul className="space-y-px">
                  {activity.slice(0, 12).map((a) => (
                    <li key={a.id} className="flex items-baseline gap-3 py-2.5 border-t border-[var(--border)] first:border-t-0">
                      <span className="text-[13px] flex-1 min-w-0">{a.summary}</span>
                      <span className="mono shrink-0">{timeAgo(a.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <ClientFields client={client} />
            <div className="card p-5">
              <p className="eyebrow mb-4">Status</p>
              <dl className="space-y-2.5 text-[13px]">
                <Row label="Invite" value={client.mustReset ? "Not accepted" : "Accepted"} />
                <Row label="Intro seen" value={client.seenIntro ? "Yes" : "No"} />
                <Row label="Created" value={fmtDate(client.createdAt)} />
                <Row label="Last seen" value={timeAgo(client.lastSeenAt)} />
                {client.startsOn && <Row label="Starts" value={fmtDate(client.startsOn)} />}
              </dl>
            </div>
            <div className="card p-5">
              <p className="eyebrow mb-4">Actions</p>
              <div className="space-y-2">
                <button onClick={() => clientAction("reset-password")} disabled={busy} className="btn btn-ghost btn-sm w-full">Issue new one-time password</button>
                {client.status === "active" ? (
                  <button onClick={() => clientAction("archive")} disabled={busy} className="btn btn-ghost btn-sm w-full">Archive creator</button>
                ) : (
                   <button onClick={() => clientAction("restore")} disabled={busy} className="btn btn-ghost btn-sm w-full">Restore creator</button>
                )}
                <button onClick={destroy} disabled={busy} className="btn btn-danger btn-sm w-full">Delete permanently</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === "journey" && (
        <div className="space-y-5">
          <p className="help">Ticking a step here completes it on the creator&apos;s behalf — useful when something happened off-portal.</p>
          {journey.map((m, i) => (
            <div key={m.slug} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="text-[15px] font-semibold">{m.title}</h2>
              </div>
              <ul className="space-y-px">
                {m.steps.map((st) => (
                  <li key={st.id}>
                    <label className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg cursor-pointer hover:bg-[var(--panel-2)] transition-colors">
                      <input type="checkbox" checked={done.has(st.id)} disabled={busy} onChange={(e) => toggleStep(st.id, e.target.checked)} className="w-4 h-4 shrink-0" />
                      <span className={`text-[13.5px] flex-1 ${done.has(st.id) ? "text-[var(--muted)]" : ""}`}>{st.title}</span>
                      <span className="mono shrink-0">{st.type}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {checklists.map((c) => (
            <div key={c.stepId} className="card p-5">
              <p className="eyebrow mb-3">{c.title} · checklist</p>
              <ul className="space-y-1.5">
                {c.items.map((item, i) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px]">
                    <span className="w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0" style={{ borderColor: c.checked[i] ? "var(--accent)" : "var(--border-hi)", background: c.checked[i] ? "var(--accent)" : "transparent" }}>
                      {c.checked[i] && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#17150f" strokeWidth="3.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                      )}
                    </span>
                    <span className={c.checked[i] ? "text-[var(--muted)]" : ""}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === "intake" && (
        <div className="space-y-5">
          {intake.map(({ form, data, status, submittedAt }) => {
            const answered = form.fields.filter((f) => {
              const v = data[f.id];
              return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim().length > 0;
            }).length;
            return (
              <div key={form.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="text-[16px] font-semibold">{form.title}</h2>
                  <span className={`chip ${status === "submitted" ? "chip-done" : answered > 0 ? "chip-progress" : "chip-todo"}`}>
                    {status === "submitted" ? `Submitted ${fmtDate(submittedAt)}` : answered > 0 ? `Draft · ${answered}/${form.fields.length}` : "Not started"}
                  </span>
                </div>
                <dl className="space-y-px">
                  {form.fields.map((f) => {
                    const v = data[f.id];
                    const text = Array.isArray(v) ? v.join(", ") : String(v ?? "");
                    return (
                      <div key={f.id} className="py-3 border-t border-[var(--border)] last:border-b grid sm:grid-cols-[minmax(0,220px)_1fr] gap-x-6 gap-y-1">
                        <dt className="text-[12.5px] text-[var(--muted)]">{f.label}</dt>
                        <dd className="text-[13.5px] whitespace-pre-wrap">{text || <span className="text-[var(--faint)]">—</span>}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            );
          })}
        </div>
      )}

      {tab === "deliverables" && (
        <div className="card p-5">
          <AdminDeliverables userId={client.id} items={deliverables} />
        </div>
      )}

      {tab === "files" && (
        <div className="space-y-5">
          <div className="card p-5">
            <p className="eyebrow mb-3">Send a file to {client.name.split(" ")[0]}</p>
            <AdminUploader userId={client.id} />
          </div>
          <div className="card overflow-hidden">
            {files.length === 0 ? (
              <p className="text-sm text-[var(--muted)] p-8 text-center">No files yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr><th>File</th><th className="hidden sm:table-cell">Bucket</th><th className="hidden sm:table-cell">Source</th><th className="hidden md:table-cell">Size</th><th className="hidden md:table-cell">Added</th><th /></tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.id}>
                        <td className="max-w-[240px]">
                          <a href={`/api/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline underline-offset-2 truncate block">{f.name}</a>
                        </td>
                        <td className="hidden sm:table-cell mono">{f.category}</td>
                                            <td className="hidden sm:table-cell"><span className="chip chip-flat">{f.fromUs ? "Us" : "Creator"}</span></td>
                        <td className="hidden md:table-cell num text-[var(--muted)]">{fmtBytes(f.size)}</td>
                        <td className="hidden md:table-cell text-[var(--muted)]">{timeAgo(f.createdAt)}</td>
                        <td className="text-right"><a href={`/api/files/${f.id}?download=1`} className="btn btn-quiet btn-sm">Download</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <Thread initial={messages} me="admin" userId={client.id} emptyLine={`No messages with ${client.name} yet. Say hello — it is the first thing they see in the portal.`} />
      )}

      {tab === "notes" && <Notes userId={client.id} notes={notes} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function ClientFields({ client }: { client: Client }) {
  const router = useRouter();
  const [v, setV] = useState({ name: client.name, email: client.email, company: client.company, projectName: client.projectName, startsOn: client.startsOn });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    setMsg("");
    const res = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: client.id, ...v }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save.");
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <div className="card p-5">
      <p className="eyebrow mb-4">Details</p>
      <div className="space-y-3.5">
        <div><label className="label">Name</label><input className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></div>
        <div><label className="label">Company</label><input className="input" value={v.company} onChange={(e) => setV({ ...v, company: e.target.value })} /></div>
        <div><label className="label">Project</label><input className="input" value={v.projectName} onChange={(e) => setV({ ...v, projectName: e.target.value })} /></div>
        <div><label className="label">Start date</label><input type="date" className="input" value={v.startsOn} onChange={(e) => setV({ ...v, startsOn: e.target.value })} /></div>
      </div>
      {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}
      {msg && <p className="text-sm mt-3" style={{ color: "var(--accent)" }}>{msg}</p>}
      <button onClick={save} disabled={busy} className="btn btn-primary btn-sm w-full mt-4">{busy ? "Saving…" : "Save details"}</button>
    </div>
  );
}

function AdminUploader({ userId }: { userId: number }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(list)) {
      const body = new FormData();
      body.append("file", file);
      body.append("category", "delivery");
      body.append("userId", String(userId));
      const res = await fetch("/api/files", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Could not upload ${file.name}.`);
        break;
      }
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <label
        className="rounded-xl border border-dashed cursor-pointer transition-all text-center block py-6 px-4"
        style={{ borderColor: "var(--border-hi)", background: "rgba(255,255,255,0.012)" }}
      >
        <input type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <p className="text-sm font-medium">{uploading ? "Uploading…" : "Click to choose files"}</p>
        <p className="help">They land in the creator&apos;s Files tab straight away.</p>
      </label>
      {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}
    </div>
  );
}

function Notes({ userId, notes }: { userId: number; notes: { id: number; body: string; authorName: string; createdAt: string }[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, body }),
    });
    setBusy(false);
    setBody("");
    router.refresh();
  }

  async function remove(id: number) {
    await fetch("/api/admin/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="card p-5 mb-5">
        <p className="eyebrow mb-3">Internal note</p>
         <textarea className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Only your team sees this. The creator never does." />
        <button type="submit" disabled={busy || !body.trim()} className="btn btn-primary btn-sm mt-3">{busy ? "Saving…" : "Add note"}</button>
      </form>
      {notes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No notes yet.</p>
      ) : (
        <div className="space-y-2.5">
          {notes.map((n) => (
            <div key={n.id} className="card p-4">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="mono">{n.authorName} · {fmtDateTime(n.createdAt)}</span>
                <button onClick={() => remove(n.id)} className="btn btn-quiet btn-sm">Delete</button>
              </div>
              <p className="text-[13.5px] whitespace-pre-wrap leading-relaxed">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
