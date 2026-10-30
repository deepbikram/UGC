"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORM_LABEL } from "@/lib/platforms";
import type { ContentVideo } from "@/lib/content";

export default function AdminContentForm({ initial }: { initial: ContentVideo[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState<ContentVideo[]>(initial);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/content");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setVideos(data.videos ?? []);
    router.refresh();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Give the video a title.");
    if (!url.trim()) return setError("Paste the link.");
    setBusy(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), url: url.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not add that.");
    setTitle("");
    setUrl("");
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this video from the library for every creator?")) return;
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  }

  return (
    <div>
      <form onSubmit={add}>
        <div className="grid gap-3.5">
          <div>
            <label className="label" htmlFor="c-title">Title <span className="req">*</span></label>
            <input id="c-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My IELTS study routine" />
          </div>
          <div>
            <label className="label" htmlFor="c-url">Video link <span className="req">*</span></label>
            <input id="c-url" type="url" className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="TikTok, Instagram, or YouTube link…" />
          </div>
        </div>
        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary mt-5">{busy ? "Adding…" : "Add video"}</button>
      </form>

      <div className="mt-7 pt-5 hairline">
        <p className="eyebrow mb-3">Library · {videos.length}</p>
        {videos.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing shared yet. Added videos appear in every creator&apos;s Videos tab.</p>
        ) : (
          <ul className="space-y-2.5">
            {videos.map((v) => (
              <li key={v.id} className="card-flat p-4 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate">{v.title}</p>
                  <p className="mono mt-1">{PLATFORM_LABEL[v.kind]}</p>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline underline-offset-2 break-all" style={{ color: "var(--accent)" }}>
                    {v.url} ↗
                  </a>
                </div>
                <button onClick={() => remove(v.id)} className="btn btn-quiet btn-sm shrink-0" style={{ color: "var(--danger)" }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
