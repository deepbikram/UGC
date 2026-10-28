"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

type Key = { key: string; label: string; help: string; type: string };

export default function AdminSettings({ groups, values }: { groups: { group: string; keys: Key[] }[]; values: Record<string, string> }) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error || "Could not save.");
    }
    setMsg("Saved. The portal updates everywhere.");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <p className="eyebrow mb-3">Admin</p>
      <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Settings</h1>
      <p className="text-[var(--muted)] text-sm mb-8 max-w-xl">
        White-labelling lives here. Everything below is stored in your own database — change it and every client sees the new portal immediately.
      </p>

      <div className="card p-5 mb-5">
        <p className="eyebrow mb-4">Preview</p>
        <Logo size={30} name={v.portal_name || "Portico"} />
        <p className="text-[13px] text-[var(--muted)] mt-3">{v.portal_tagline}</p>
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.group} className="card p-5">
            <p className="eyebrow mb-5">{g.group}</p>
            <div className="space-y-5">
              {g.keys.map((k) => (
                <div key={k.key}>
                  <label className="label" htmlFor={k.key}>{k.label}</label>
                  {k.type === "textarea" ? (
                    <textarea id={k.key} className="input" value={v[k.key] ?? ""} onChange={(e) => setV({ ...v, [k.key]: e.target.value })} />
                  ) : k.type === "color" ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(v[k.key] ?? "") ? v[k.key] : "#d8cfc0"}
                        onChange={(e) => setV({ ...v, [k.key]: e.target.value })}
                        className="w-11 h-10 rounded-lg border border-[var(--border)] bg-transparent cursor-pointer shrink-0"
                        aria-label={k.label}
                      />
                      <input id={k.key} className="input" value={v[k.key] ?? ""} onChange={(e) => setV({ ...v, [k.key]: e.target.value })} placeholder="#d8cfc0" />
                    </div>
                  ) : (
                    <input id={k.key} className="input" value={v[k.key] ?? ""} onChange={(e) => setV({ ...v, [k.key]: e.target.value })} />
                  )}
                  <p className="help">{k.help}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {error && <p className="text-sm text-[var(--danger)] mt-5">{error}</p>}
      {msg && <p className="text-sm mt-5" style={{ color: "var(--accent)" }}>{msg}</p>}

      <div className="flex items-center gap-3 mt-6">
        <button onClick={save} disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save settings"}</button>
        <span className="mono">Stored in your database, not in code</span>
      </div>
    </div>
  );
}
