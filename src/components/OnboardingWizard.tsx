"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import type { Form } from "@/lib/forms";
import FormStep from "./steps/FormStep";

type FormState = {
  form: Form;
  data: Record<string, string | string[]>;
  status: string;
};

function celebrate() {
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 38,
    origin: { y: 0.3 },
    colors: ["#d8cfc0", "#f4f3ef", "#b9b0a1"],
    disableForReducedMotion: true,
  });
}

export default function OnboardingWizard({
  firstName,
  portalName,
  screens,
  agreeItems,
  profile,
  payout,
}: {
  firstName: string;
  portalName: string;
  screens: { id: string; kicker: string; title: string; minutes: number; html: string }[];
  agreeItems: string[];
  profile: FormState;
  payout: FormState;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<"learn" | "agree" | "joined" | "profile" | "payout">("learn");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage === "joined") celebrate();
  }, [stage ]);

  // Next/Back/agree navigate between long screens — start each at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index, stage]);

  async function agree() {
    setError("");
    if (!checked) {
      setError("Tick the agreement to continue.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/onboarding/agree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agree: true }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save.");
      return;
    }
    setStage("joined");
  }

  function startPartTwo() {
    setStage(profile.status === "submitted" ? "payout" : "profile");
  }

  const total = screens.length;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-14 lg:py-20">
      <div className="w-full max-w-2xl fade-up">
        {(stage === "learn" || stage === "agree") && (
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-2">
              <span className="eyebrow">Part 1 · Onboarding</span>
              <span className="text-xs font-semibold num text-[var(--muted)]">
                {stage === "learn" ? `${index + 1}/${total + 1}` : `${total + 1}/${total + 1}`}
              </span>
            </div>
            <div className="bar">
              <div
                className="bar-fill"
                style={{ width: `${Math.round(((stage === "learn" ? index : total) / (total + 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {stage === "learn" && (
          <div key={screens[index].id}>
            <p className="eyebrow mb-3">{screens[index].kicker}</p>
            <h1 className="text-[1.7rem] lg:text-[2.1rem] font-bold mb-2 title-grad leading-tight">{screens[index].title}</h1>
            <p className="mono mb-6">{screens[index].minutes} min read</p>
            <div className="prose mb-10" dangerouslySetInnerHTML={{ __html: screens[index].html }} />
            <div className="flex items-center justify-between gap-4 pt-6 hairline">
              {index > 0 ? (
                <button onClick={() => setIndex(index - 1)} className="btn btn-ghost btn-sm">← Back</button>
              ) : (
                <span />
              )}
              {index < total - 1 ? (
                <button onClick={() => setIndex(index + 1)} className="btn btn-primary">Next →</button>
              ) : (
                <button onClick={() => setStage("agree")} className="btn btn-primary">Review and agree →</button>
              )}
            </div>
          </div>
        )}

        {stage === "agree" && (
          <div>
            <p className="eyebrow mb-3">Final step of Part 1</p>
            <h1 className="text-[1.7rem] lg:text-[2.1rem] font-bold mb-3 title-grad leading-tight">
              Agree to everything{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-7">
              Everything Part 1 covered, in one list. One agreement covers it all.
            </p>
            <ul className="space-y-1 mb-8">
              {agreeItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 px-3 -mx-3">
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-semibold num shrink-0 mt-0.5" style={{ borderColor: "var(--border-hi)", color: "var(--muted)" }}>
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-3 py-3.5 px-4 -mx-4 rounded-lg cursor-pointer hover:bg-[var(--panel-2)] transition-colors card-flat">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked((v) => !v)}
                className="mt-0.5 w-4 h-4 shrink-0"
              />
              <span className="text-sm font-medium leading-relaxed">I have read and agree to everything above.</span>
            </label>
            {error && <p className="text-sm text-[var(--danger)] mt-4">{error}</p>}
            <div className="flex items-center justify-between gap-4 mt-7 pt-6 hairline">
              <button onClick={() => setStage("learn")} className="btn btn-ghost btn-sm">← Back</button>
              <button onClick={agree} disabled={busy} className="btn btn-primary">
                {busy ? "Saving…" : "Agree and continue"}
              </button>
            </div>
          </div>
        )}

        {stage === "joined" && (
          <div className="text-center py-10 rise-in">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="mx-auto mb-6 pop">
              <circle cx="12" cy="12" r="11" fill="var(--accent)" />
              <path d="M7.6 12.3l3 3 5.8-6.3" stroke="#17150f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="eyebrow mb-3">{portalName}</p>
            <h1 className="text-[2rem] lg:text-[2.6rem] font-bold mb-3 title-grad leading-tight">
              You&apos;ve joined{firstName ? `, ${firstName}` : ""}.
            </h1>
            <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-10 max-w-md mx-auto">
              Guidelines agreed. Next: Part 2 — your profile and where monthly payouts go.
            </p>
            <button onClick={startPartTwo} className="btn btn-primary w-full py-3.5 text-[14px]">
              Continue to payout section →
            </button>
          </div>
        )}

        {stage === "profile" && (
          <div>
            <p className="eyebrow mb-3">Part 2 · Your profile</p>
            <h1 className="text-[1.7rem] lg:text-[2.1rem] font-bold mb-7 title-grad leading-tight">Where you publish</h1>
            <FormStep form={profile.form} initial={profile.data} status={profile.status} onSubmitted={() => setStage("payout")} />
          </div>
        )}

        {stage === "payout" && (
          <div>
            <p className="eyebrow mb-3">Part 2 · Payout details</p>
            <h1 className="text-[1.7rem] lg:text-[2.1rem] font-bold mb-7 title-grad leading-tight">Where payouts go</h1>
            <FormStep
              form={payout.form}
              initial={payout.data}
              status={payout.status}
              onSubmitted={() => {
                router.push("/");
                router.refresh();
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
