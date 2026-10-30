"use client";

import { useState } from "react";
import { fmtBytes, timeAgo } from "@/lib/format";
import type { StepFile } from "@/lib/stepData";

type Row = StepFile & { category: string; fromUs: boolean; isLink?: boolean; url?: string };

export default function FilesView({ initial, portalName }: { initial: Row[]; portalName: string }) {
  const [rows, setRows] = useState<Row[]>(initial);

  const shown = rows;

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
      <p className="eyebrow mb-3">Content</p>
      <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Everything shared</h1>
      <p className="text-[var(--muted)] text-sm mb-8 max-w-xl">
        Everything we share with you lives here — files and links, the moment they are ready.
      </p>

      <div className="flex items-center gap-1 mb-4">
        <span className="text-[13px] text-[var(--muted)]">From {portalName} and you · <span className="mono num">{rows.length}</span></span>
      </div>

      {shown.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium">Nothing here yet.</p>
          <p className="help mt-1.5">Links and files we share with you will appear here.</p>
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
                      {f.isLink && f.url ? (
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline underline-offset-2 truncate block">
                          {f.name} ↗
                        </a>
                      ) : (
                        <a href={`/api/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline underline-offset-2 truncate block">
                          {f.name}
                        </a>
                      )}
                      <span className="mono">{f.isLink ? "link" : f.category}</span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="chip chip-flat">{f.fromUs ? portalName : "You"}</span>
                    </td>
                    <td className="hidden sm:table-cell num text-[var(--muted)]">{f.isLink ? "—" : fmtBytes(f.size)}</td>
                    <td className="hidden md:table-cell text-[var(--muted)]">{timeAgo(f.createdAt)}</td>
                    <td className="text-right whitespace-nowrap">
                      {f.isLink && f.url ? (
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-sm">Open ↗</a>
                      ) : (
                        <a href={`/api/files/${f.id}?download=1`} className="btn btn-quiet btn-sm">Download</a>
                      )}
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
