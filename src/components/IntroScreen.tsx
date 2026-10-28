"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function IntroScreen({
  portalName,
  headline,
  body,
  firstName,
  phases,
}: {
  portalName: string;
  headline: string;
  body: string;
  firstName: string;
  phases: { title: string; description: string; steps: number }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function enter() {
    setBusy(true);
    await fetch("/api/intro-seen", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-14 lg:py-20">
      <div className="w-full max-w-2xl">
        <div className="fade-up mb-14 flex justify-center">
          <Logo size={62} name={portalName} stacked />
        </div>

        <p className="eyebrow mb-4 fade-up" style={{ animationDelay: "0.15s" }}>
          {firstName ? `Hello, ${firstName}` : "Hello"}
        </p>
        <h1 className="text-3xl lg:text-[2.6rem] leading-[1.1] font-bold mb-5 title-grad fade-up" style={{ animationDelay: "0.25s" }}>
          {headline}
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--muted)] mb-12 fade-up" style={{ animationDelay: "0.35s" }}>
          {body}
        </p>

        <div className="space-y-px mb-12">
          {phases.map((p, i) => (
            <div
              key={p.title}
              className="fade-up flex gap-5 items-start py-5 border-t border-[var(--border)] last:border-b"
              style={{ animationDelay: `${0.45 + i * 0.1}s` }}
            >
              <span className="mono pt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold">{p.title}</p>
                <p className="text-[13px] mt-1 leading-relaxed text-[var(--muted)]">{p.description}</p>
              </div>
              <span className="chip chip-flat shrink-0 num">{p.steps} {p.steps === 1 ? "step" : "steps"}</span>
            </div>
          ))}
        </div>

        <div className="fade-up" style={{ animationDelay: `${0.5 + phases.length * 0.1}s` }}>
          <button onClick={enter} disabled={busy} className="btn btn-primary w-full py-3.5 text-[14px]">
            {busy ? "Opening…" : "Enter the portal"}
          </button>
          <p className="text-xs text-center mt-4 text-[var(--faint)]">You will only see this once. Everything below lives in the sidebar from here on.</p>
        </div>
      </div>
    </main>
  );
}
