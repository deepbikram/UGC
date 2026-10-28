"use client";

import { useState } from "react";
import { fmtBytes, timeAgo } from "@/lib/format";
import Uploader from "./Uploader";
import type { StepFile } from "@/lib/stepData";

type Row = StepFile & { category: string; fromUs: boolean };

export default function FilesView({ initial, portalName }: { initial: Row[]; portalName: string }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [tab, setTab] = useState<"all" | "yours" | "ours">("all");

  const shown = rows.filter((r) => (tab === "all" ? true : tab === "ours" ? r.fromUs : !r.fromUs));

  async function remove(id: number) {
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto fade-up">
      <p className="eyebrow mb-3">Files</p>
      <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Everything shared</h1>
      <p className="text-[var(--muted)] text-sm mb-8 max-w-xl">
        Files move both ways here. What you upload reaches us instantly; what we deliver shows up the moment it is ready.
      </p>

      <div className="card p-5 mb-8">
        <p className="eyebrow mb-3">Share something with us</p>
        <Uploader
          category="general"
          files={[]}
          compact
          onChange={(next) => {
            const fresh = next
              .filter((n) => !rows.some((r) => r.id === n.id))
              .map((n) => ({ ...n, category: "general", fromUs: false }));
            if (fresh.length) setRows((prev) => [...fresh, ...prev]);
          }}
        />
      </div>

      <div className="flex items-center gap-1 mb-4">
        {(
          [
            { key: "all", label: "All" },
            { key: "yours", label: "From you" },
            { key: "ours", label: `From ${portalName}` },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[13px] font-medium rounded-lg px-3.5 py-1.5 transition-colors ${tab === t.key ? "bg-[var(--panel-hi)] text-white" : "text-[var(--muted)] hover:text-white"}`}
          >
            {t.label}
            <span className="ml-2 mono num">{rows.filter((r) => (t.key === "all" ? true : t.key === "ours" ? r.fromUs : !r.fromUs)).length}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium">Nothing here yet.</p>
          <p className="help mt-1.5">Drop a file above and it appears instantly.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>File</th>
                  <th className="hidden sm:table-cell">Source</th>
                  <th className="hidden sm:table-cell">Size</th>
                  <th className="hidden md:table-cell">Added</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((f) => (
                  <tr key={f.id}>
                    <td className="max-w-[260px]">
                      <a href={`/api/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline underline-offset-2 truncate block">
                        {f.name}
                      </a>
                      <span className="mono">{f.category}</span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="chip chip-flat">{f.fromUs ? portalName : "You"}</span>
                    </td>
                    <td className="hidden sm:table-cell num text-[var(--muted)]">{fmtBytes(f.size)}</td>
                    <td className="hidden md:table-cell text-[var(--muted)]">{timeAgo(f.createdAt)}</td>
                    <td className="text-right whitespace-nowrap">
                      <a href={`/api/files/${f.id}?download=1`} className="btn btn-quiet btn-sm">Download</a>
                      {!f.fromUs && (
                        <button onClick={() => remove(f.id)} className="btn btn-quiet btn-sm">Remove</button>
                      )}
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
