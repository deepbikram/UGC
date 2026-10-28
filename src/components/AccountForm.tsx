"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountForm({ name: initialName }: { name: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save.");
    setCurrent("");
    setNew("");
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card p-5 space-y-5">
      <div>
        <label className="label" htmlFor="name">Display name</label>
        <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="pt-5 hairline">
        <p className="eyebrow mb-4">Change password</p>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="cur">Current password</label>
            <input id="cur" type="password" className="input" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <label className="label" htmlFor="new">New password</label>
            <input id="new" type="password" className="input" value={newPassword} onChange={(e) => setNew(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
            <p className="help">Leave both blank to keep your current password.</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {msg && <p className="text-sm" style={{ color: "var(--accent)" }}>{msg}</p>}

      <button type="submit" disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
