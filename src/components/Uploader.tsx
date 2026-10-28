"use client";

import { useRef, useState } from "react";
import { fmtBytes } from "@/lib/format";
import type { StepFile } from "@/lib/stepData";

export default function Uploader({
  category,
  files,
  onChange,
  compact = false,
}: {
  category: string;
  files: StepFile[];
  onChange: (files: StepFile[]) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError("");
    setBusy(true);
    let latest = files;
    for (const file of Array.from(list)) {
      const body = new FormData();
      body.append("file", file);
      body.append("category", category);
      const res = await fetch("/api/files", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Could not upload ${file.name}.`);
        break;
      }
      latest = (data.files as { id: number; file_name: string; size: number; created_at: string; mime: string }[]).map((f) => ({
        id: f.id,
        name: f.file_name,
        size: f.size,
        createdAt: f.created_at,
        mime: f.mime,
      }));
    }
    onChange(latest);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: number) {
    setBusy(true);
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    if (res.ok) onChange(files.filter((f) => f.id !== id));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border border-dashed cursor-pointer transition-all text-center ${compact ? "py-6 px-4" : "py-10 px-6"}`}
        style={{
          borderColor: dragging ? "var(--accent)" : "var(--border-hi)",
          background: dragging ? "var(--accent-soft)" : "rgba(255,255,255,0.012)",
        }}
      >
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={dragging ? "var(--accent)" : "#6c6a64"} strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3">
          <path d="M12 16V5M8 8.5L12 4.5l4 4" />
          <path d="M4.5 15v3a2 2 0 002 2h11a2 2 0 002-2v-3" />
        </svg>
        <p className="text-sm font-medium">{busy ? "Uploading…" : dragging ? "Drop to upload" : "Drop files here, or click to choose"}</p>
        <p className="help">Up to 25 MB each. Images, PDFs, documents, archives, and fonts.</p>
      </div>

      {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-px">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2.5 border-t border-[var(--border)] last:border-b">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6c6a64" strokeWidth="1.6" className="shrink-0">
                <path d="M6 4.5h7l5 5V19a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V6a1.5 1.5 0 011.5-1.5z" />
                <path d="M13 4.5V10h5" />
              </svg>
              <a href={`/api/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="text-[13.5px] truncate flex-1 hover:underline underline-offset-2">
                {f.name}
              </a>
              <span className="mono shrink-0">{fmtBytes(f.size)}</span>
              <button onClick={() => remove(f.id)} disabled={busy} className="btn btn-quiet btn-sm shrink-0" aria-label={`Remove ${f.name}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
