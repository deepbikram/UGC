"use client";

import { fmtBytes } from "@/lib/format";
import type { StepFile } from "@/lib/stepData";

export default function HandoffStep({
  intro,
  deliverables,
  files,
  supportEmail,
  projectName,
  clientName,
  portalName,
}: {
  intro: string;
  deliverables: { id: number; title: string; status: string; url: string }[];
  files: StepFile[];
  supportEmail: string;
  projectName: string;
  clientName: string;
  portalName: string;
}) {
  const approved = deliverables.filter((d) => d.status === "approved");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[17px] font-semibold">Handoff pack</h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            {[clientName, projectName].filter(Boolean).join(" · ") || portalName}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn btn-ghost btn-sm no-print shrink-0">Print or save as PDF</button>
      </div>

      <div className="prose mb-8" dangerouslySetInnerHTML={{ __html: intro }} />

      <section className="mb-8">
        <h4 className="eyebrow mb-3">Approved deliverables</h4>
        {approved.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing approved yet. Approved items collect here automatically.</p>
        ) : (
          <ul className="space-y-px">
            {approved.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3 border-t border-[var(--border)] last:border-b">
                <span className="text-sm flex-1 min-w-0 truncate">{d.title}</span>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium shrink-0 hover:underline underline-offset-2" style={{ color: "var(--accent)" }}>
                    Open ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h4 className="eyebrow mb-3">Every file from the project</h4>
        {files.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No files have been shared yet.</p>
        ) : (
          <ul className="space-y-px">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-3 border-t border-[var(--border)] last:border-b">
                <a href={`/api/files/${f.id}?download=1`} className="text-sm flex-1 min-w-0 truncate hover:underline underline-offset-2">{f.name}</a>
                <span className="mono shrink-0">{f.category}</span>
                <span className="mono shrink-0">{fmtBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="card-flat p-5">
        <p className="text-sm font-medium mb-1">After handoff</p>
        <p className="text-[13px] text-[var(--muted)] leading-relaxed">
          This portal stays open — come back for anything you need. Questions land fastest at{" "}
          <a href={`mailto:${supportEmail}`} className="underline underline-offset-2 text-white">{supportEmail}</a>.
        </p>
      </div>
    </div>
  );
}
