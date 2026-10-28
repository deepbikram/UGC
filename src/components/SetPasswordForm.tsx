"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function SetPasswordForm({ portalName, name, isAdmin }: { portalName: string; name: string; isAdmin: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firstName = (name || "").split(" ")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Those two do not match.");
    if (password.trim().length < 8) return setError("Use at least 8 characters.");

    setLoading(true);
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "Something went wrong.");
    router.push(isAdmin ? "/admin" : "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-sm fade-up">
        <div className="flex justify-center mb-10">
          <Logo size={58} name={portalName} stacked />
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-semibold">{firstName ? `One thing first, ${firstName}.` : "One thing first."}</h1>
          <p className="text-sm mt-1.5 mb-7 text-[var(--muted)]">
            You signed in with a one-time password. Choose your own to finish setting up your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="pw">New password</label>
              <input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="input" autoFocus autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="pw2">Confirm it</label>
              <input id="pw2" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" className="input" autoComplete="new-password" />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 mt-1">
              {loading ? "Saving…" : "Save and continue"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
