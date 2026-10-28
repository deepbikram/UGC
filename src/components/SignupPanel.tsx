"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const CONTACT_METHODS = ["WhatsApp", "Phone", "Email", "Viber"];

export default function SignupPanel({
  portalName,
  supportEmail,
}: {
  portalName: string;
  supportEmail: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [contactMethod, setContactMethod] = useState(CONTACT_METHODS[0]);
  const [contactHandle, setContactHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, country, contactMethod, contactHandle }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create your account.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md fade-up">
        <div className="flex justify-center mb-10">
          <Logo size={58} name={portalName} stacked />
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold">Join the creator program</h2>
          <p className="text-sm mt-1.5 mb-7 text-[var(--muted)]">
            Create your account to start onboarding. No follower threshold, no fees.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="su-name">Full name</label>
              <input id="su-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" autoFocus autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="su-email">Email</label>
              <input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="su-country">Country / location</label>
              <input id="su-country" type="text" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Nepal" className="input" autoComplete="country-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="su-method">Contact via</label>
                <select id="su-method" value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} className="input">
                  {CONTACT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="su-handle">Handle / number</label>
                <input id="su-handle" type="text" required value={contactHandle} onChange={(e) => setContactHandle(e.target.value)} placeholder="+977 …" className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="su-password">Password</label>
              <input id="su-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="input" autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="su-confirm">Confirm password</label>
              <input id="su-confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" className="input" autoComplete="new-password" />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 mt-1">
              {loading ? "Creating…" : "Create creator account"}
            </button>
          </form>
        </div>
        <p className="text-xs text-center mt-6 leading-relaxed text-[var(--faint)]">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-neutral-300">Sign in</Link>
          <br />
          Questions? Email{" "}
          <a href={`mailto:${supportEmail}`} className="underline underline-offset-2 hover:text-neutral-300">{supportEmail}</a>
        </p>
      </div>
    </main>
  );
}
