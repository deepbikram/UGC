"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import type { Module } from "@/lib/journey";
import type { StepData } from "@/lib/stepData";
import DocStep from "./steps/DocStep";
import FormStep from "./steps/FormStep";
import UploadStep from "./steps/UploadStep";
import ChecklistStep from "./steps/ChecklistStep";
import ActionStep from "./steps/ActionStep";
import BoardStep from "./steps/BoardStep";
import HandoffStep from "./steps/HandoffStep";

export type { StepData };

const TYPE_LABEL: Record<string, string> = {
  doc: "Read",
  form: "Form",
  upload: "Upload",
  action: "Action",
  checklist: "Checklist",
  board: "Live board",
  handoff: "Pack",
};

export default function ModuleView({
  module: mod,
  index,
  completed,
  stepData,
  prev,
  next,
  nextUnlocked,
  numberOffset = 0,
  hideFooterNav = false,
}: {
  module: Module;
  index: number;
  completed: string[];
  stepData: Record<string, StepData>;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  nextUnlocked: boolean;
  /** Stacked single-page mode: continue numbering and hide prev/next footer. */
  numberOffset?: number;
  hideFooterNav?: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState<Set<string>>(new Set(completed));
  const [open, setOpen] = useState<string | null>(() => mod.steps.find((s) => !completed.includes(s.id))?.id ?? mod.steps[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [checkErr, setCheckErr] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    for (const s of mod.steps) {
      const d = stepData[s.id];
      if (d?.kind === "checklist") init[s.id] = [...d.checked];
    }
    return init;
  });

  function celebrate() {
    confetti({
      particleCount: 90,
      spread: 74,
      startVelocity: 34,
      origin: { y: 0.28 },
      colors: ["#d8cfc0", "#f4f3ef", "#b9b0a1"],
      disableForReducedMotion: true,
    });
  }

  async function setComplete(stepId: string, value: boolean) {
    setBusy(stepId);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, done: value }),
    });
    setBusy(null);
    if (!res.ok) return;

    const nextDone = new Set(done);
    if (value) nextDone.add(stepId);
    else nextDone.delete(stepId);
    setDone(nextDone);

    if (value) {
      const remaining = mod.steps.filter((s) => !nextDone.has(s.id));
      if (remaining.length === 0) {
        celebrate();
        setOpen(null);
      } else {
        setOpen(remaining[0].id);
      }
    }
    router.refresh();
  }

  /** Steps that complete themselves when their content is satisfied. */
  function markFromContent(stepId: string) {
    if (done.has(stepId)) {
      router.refresh();
      return;
    }
    setComplete(stepId, true);
  }

  /** Acknowledgement: all boxes compulsory, submitted explicitly, then locked. */
  async function agreeChecklist(stepId: string) {
    const step = mod.steps.find((s) => s.id === stepId);
    const total = step?.checklist?.length ?? 0;
    const answers = checks[stepId] ?? [];
    if (!(answers.length === total && answers.every(Boolean))) {
      setCheckErr((p) => ({ ...p, [stepId]: `Tick all ${total} boxes to continue.` }));
      return;
    }
    setCheckErr((p) => ({ ...p, [stepId]: "" }));
    setBusy(stepId);
    const res = await fetch(`/api/forms/${stepId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { items: answers }, submit: true }),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCheckErr((p) => ({ ...p, [stepId]: data.error || "Could not submit." }));
      return;
    }
    await setComplete(stepId, true);
  }

  return (
    <div className="max-w-3xl mx-auto fade-up">
      <p className="eyebrow mb-3">Module {String(index + 1).padStart(2, "0")}</p>
      <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-3 title-grad leading-tight">{mod.title}</h1>
      <p className="text-[var(--muted)] text-[14.5px] leading-relaxed mb-9 max-w-2xl">{mod.description}</p>

      <div className="space-y-2.5">
        {mod.steps.map((step, i) => {
          const isDone = done.has(step.id);
          const isOpen = open === step.id;
          const data = stepData[step.id];

          return (
            <div key={step.id} className={`card overflow-hidden transition-colors ${isOpen ? "" : "card-hover"}`} style={isOpen ? { borderColor: "var(--border-hi)" } : undefined}>
              <button
                onClick={() => setOpen(isOpen ? null : step.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="shrink-0">
                  {isDone ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="pop">
                      <circle cx="12" cy="12" r="11" fill="var(--accent)" />
                      <path d="M7.6 12.3l3 3 5.8-6.3" stroke="#17150f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-semibold num" style={{ borderColor: "var(--border-hi)", color: "var(--muted)" }}>
                      {i + 1 + numberOffset}
                    </span>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-[15px] font-semibold ${isDone && !isOpen ? "text-[var(--muted)]" : ""}`}>{step.title}</span>
                    <span className="mono">{TYPE_LABEL[step.type]}</span>
                  </span>
                  {!isOpen && <span className="block text-[13px] text-[var(--muted)] mt-0.5 truncate">{step.description}</span>}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c6a64" strokeWidth="2" strokeLinecap="round" className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 pt-1">
                  <p className="text-[13.5px] text-[var(--muted)] leading-relaxed mb-6 max-w-2xl">{step.description}</p>

                  {data?.kind === "doc" && <DocStep title={data.title} minutes={data.minutes} html={data.html} />}
                  {data?.kind === "form" && (
                    <FormStep form={data.form} initial={data.data} status={data.status} onSubmitted={() => markFromContent(step.id)} />
                  )}
                  {data?.kind === "upload" && (
                    <UploadStep category={data.category} asks={data.asks} initialFiles={data.files} onUploaded={() => markFromContent(step.id)} />
                  )}
                  {data?.kind === "checklist" && (
                    <ChecklistStep
                      stepId={step.id}
                      items={data.items}
                      checked={checks[step.id] ?? data.checked}
                      disabled={isDone}
                      onChange={(next) => {
                        setChecks((p) => ({ ...p, [step.id]: next }));
                        if (next.length === data.items.length && next.every(Boolean)) {
                          setCheckErr((p) => ({ ...p, [step.id]: "" }));
                        }
                      }}
                    />
                  )}
                  {data?.kind === "action" && <ActionStep label={data.label} url={data.url} note={data.note} />}
                  {data?.kind === "board" && <BoardStep />}
                  {data?.kind === "handoff" && (
                    <HandoffStep
                      intro={data.intro}
                      deliverables={data.deliverables}
                      files={data.files}
                      supportEmail={data.supportEmail}
                      projectName={data.projectName}
                      clientName={data.clientName}
                      portalName={data.portalName}
                    />
                  )}

                  <div className="flex items-center gap-3 mt-7 pt-5 hairline no-print">
                    {isDone ? (
                      <>
                        <span className="chip chip-done">Complete</span>
                        <button onClick={() => setComplete(step.id, false)} disabled={busy === step.id} className="btn btn-quiet btn-sm">
                          Reopen
                        </button>
                      </>
                    ) : step.type === "checklist" ? (
                      <div>
                        <button onClick={() => agreeChecklist(step.id)} disabled={busy === step.id} className="btn btn-primary">
                          {busy === step.id ? "Saving…" : "Agree and continue"}
                        </button>
                        {checkErr[step.id] ? (
                          <p className="text-sm text-[var(--danger)] mt-3">{checkErr[step.id]}</p>
                        ) : (
                          <p className="mono mt-3">Tick every box to continue.</p>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => setComplete(step.id, true)} disabled={busy === step.id} className="btn btn-primary">
                        {busy === step.id ? "Saving…" : "Mark complete"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hideFooterNav && (
      <div className="flex items-center justify-between gap-4 mt-10 pt-6 hairline">
        {prev ? (
          <Link href={`/module/${prev.slug}`} className="btn btn-ghost btn-sm">← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next && nextUnlocked ? (
          <Link href={`/module/${next.slug}`} className="btn btn-ghost btn-sm">{next.title} →</Link>
        ) : next ? (
          <span className="mono">Finish this module to unlock {next.title}</span>
        ) : (
          <span />
        )}
      </div>
      )}
    </div>
  );
}
