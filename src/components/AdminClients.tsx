"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/format";
import type { ClientSummary } from "@/lib/clients";

type Created = { id: number; name: string; email: string; password: string };

export default function AdminClients({
  clients,
  attention,
}: {
  clients: ClientSummary[];
  attention: { clientId: number; client: string; message: string; severity: "action" | "warn" | "info" }[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(clients.length === 0);
  const [form, setForm] = useState({ name: "", email: "", company: "", projectName: "", startsOn: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const visible = clients
    .filter((c) => (showArchived ? true : c.status === "active"))
    .filter((c) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return [c.name, c.email, c.company, c.projectName].some((v) => v.toLowerCase().includes(needle));
    });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setCopied(false);
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not create that creator.");
    setCreated({ id: data.id, name: form.name, email: data.email, password: data.password });
    setForm({ name: "", email: "", company: "", projectName: "", startsOn: "" });
    setShowForm(false);
    router.refresh();
  }

  const inviteText = created
    ? `Your Band9Prep creator portal is ready.\n\nSign in: ${typeof window !== "undefined" ? window.location.origin : ""}/login\nEmail: ${created.email}\nOne-time password: ${created.password}\n\nYou will be asked to choose your own password the first time you sign in.`
    : "";

  const active = clients.filter((c) => c.status === "active");
  const kpis = [
    { label: "Active creators", value: active.length },
    { label: "Needs attention", value: attention.filter((a) => a.severity !== "info").length },
    { label: "In review", value: active.reduce((a, c) => a + c.deliverables.review, 0) },
    { label: "Unread", value: active.reduce((a, c) => a + c.unread, 0) },
  ];

  return (
    <div className="max-w-6xl mx-auto fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-3">Admin</p>
          <h1 className="text-[2rem] lg:text-[2.4rem] font-bold title-grad">Creators</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary">
          {showForm ? "Cancel" : "+ New creator"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7 stagger">
        {kpis.map((k) => (
          <div key={k.label} className="card-flat px-4 py-3.5">
            <p className="eyebrow mb-1.5">{k.label}</p>
            <p className="text-[1.5rem] font-bold num leading-none">{k.value}</p>
          </div>
        ))}
      </div>

      {created && (
        <div className="card p-5 mb-7 rise-in" style={{ borderColor: "rgba(216,207,192,0.4)", background: "rgba(216,207,192,0.05)" }}>
          <p className="text-sm font-semibold mb-1">{created.name} is set up.</p>
          <p className="text-[13px] text-[var(--muted)] mb-4">
            This one-time password is shown once and is not recoverable. Send it to them, then it is replaced the first time they sign in.
          </p>
          <pre className="card-flat p-4 text-[12.5px] leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-mono)] mb-3">{inviteText}</pre>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteText);
                setCopied(true);
              }}
              className="btn btn-light btn-sm"
            >
              {copied ? "Copied" : "Copy invite"}
            </button>
            <Link href={`/admin/clients/${created.id}`} className="btn btn-ghost btn-sm">Open their profile →</Link>
            <button onClick={() => setCreated(null)} className="btn btn-quiet btn-sm">Dismiss</button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={create} className="card p-5 mb-7 rise-in">
          <p className="eyebrow mb-4">New creator</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="c-name">Name <span className="req">*</span></label>
              <input id="c-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dana Whitfield" />
            </div>
            <div>
              <label className="label" htmlFor="c-email">Email <span className="req">*</span></label>
              <input id="c-email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="dana@company.com" />
            </div>
            <div>
              <label className="label" htmlFor="c-company">Company</label>
              <input id="c-company" className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Northwind Studio" />
            </div>
            <div>
              <label className="label" htmlFor="c-project">Project name</label>
              <input id="c-project" className="input" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="Brand refresh" />
            </div>
            <div>
              <label className="label" htmlFor="c-start">Start date</label>
              <input id="c-start" type="date" className="input" value={form.startsOn} onChange={(e) => setForm({ ...form, startsOn: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-[var(--danger)] mt-4">{error}</p>}
          <div className="flex items-center gap-3 mt-5 pt-5 hairline">
            <button type="submit" disabled={busy} className="btn btn-primary">{busy ? "Creating…" : "Create creator"}</button>
            <span className="mono">A one-time password is generated for you</span>
          </div>
        </form>
      )}

      {attention.length > 0 && (
        <div className="card p-5 mb-7">
          <p className="eyebrow mb-3">Needs attention</p>
          <ul className="space-y-px">
            {attention.slice(0, 6).map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 border-t border-[var(--border)] first:border-t-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: a.severity === "action" ? "var(--accent)" : a.severity === "warn" ? "var(--warn)" : "#4d4c48" }}
                />
                <Link href={`/admin/clients/${a.clientId}`} className="text-sm font-medium hover:underline underline-offset-2 shrink-0">
                  {a.client}
                </Link>
                <span className="text-[13px] text-[var(--muted)] truncate">{a.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Search creators…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="flex items-center gap-2 text-[13px] text-[var(--muted)] cursor-pointer">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium">{clients.length === 0 ? "No creators yet." : "Nothing matches that."}</p>
          <p className="help mt-1.5">{clients.length === 0 ? "Creators can sign up themselves, or create one here and send the invite." : "Try a different search."}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th className="hidden md:table-cell">Phase</th>
                  <th>Progress</th>
                  <th className="hidden lg:table-cell">Board</th>
                  <th className="hidden lg:table-cell">Last seen</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/clients/${c.id}`} className="font-medium hover:underline underline-offset-2">
                        {c.name}
                      </Link>
                      <div className="text-xs text-[var(--muted)] truncate max-w-[220px]">
                        {c.company || c.email}
                        {c.status === "archived" && <span className="ml-2 chip chip-flat">Archived</span>}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="chip chip-flat">{c.phase}</span>
                    </td>
                    <td className="min-w-[150px]">
                      <div className="flex items-center gap-2.5">
                        <div className="bar bar-thin flex-1 min-w-[70px]">
                          <div className={`bar-fill ${c.pct === 100 ? "bar-fill-done" : ""}`} style={{ width: `${c.pct}%` }} />
                        </div>
                        <span className="mono num shrink-0">{c.pct}%</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell text-[var(--muted)] num">
                      {c.deliverables.approved}/{c.deliverables.total}
                      {c.deliverables.review > 0 && <span className="ml-2 chip chip-review">{c.deliverables.review} in review</span>}
                    </td>
                    <td className="hidden lg:table-cell text-[var(--muted)]">{timeAgo(c.lastSeenAt)}</td>
                    <td className="text-right whitespace-nowrap">
                      {c.unread > 0 && (
                        <span className="num text-[10.5px] font-bold rounded-full px-1.5 py-0.5 mr-2" style={{ background: "var(--accent)", color: "#17150f" }}>
                          {c.unread}
                        </span>
                      )}
                      <Link href={`/admin/clients/${c.id}`} className="btn btn-quiet btn-sm">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
