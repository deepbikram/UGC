"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLATFORMS = [
  { label: "TikTok", kind: "tiktok", placeholder: "https://tiktok.com/@you/video/…", example: "https://www.tiktok.com/@yourhandle/video/7382910485729139974" },
  { label: "Instagram Reels", kind: "instagram", placeholder: "https://instagram.com/reel/…", example: "https://www.instagram.com/reel/ABC123xyz/" },
  { label: "YouTube Shorts", kind: "youtube", placeholder: "https://youtube.com/shorts/…", example: "https://www.youtube.com/shorts/abc123XYZ78" },
] as const;

export default function VideoSubmitForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<string>("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const current = PLATFORMS.find((p) => p.label === platform);

  async function submit() {
    setError("");
    setDone("");
    if (!platform) {
      setError("Choose the platform you uploaded on first.");
      return;
    }
    if (!url.trim()) {
      setError("Paste your video URL first.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), platform }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not submit.");
      return;
    }
    setUrl("");
    setDone("Submitted — it is now awaiting review.");
    router.refresh();
  }

  return (
    <div className="card-flat p-4 sm:p-5 mb-8">
      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-5">
        <div>
          <label className="label" htmlFor="video-platform">
            Platform you uploaded on <span className="req">*</span>
          </label>
          <select
            id="video-platform"
            className="input"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="">Choose one…</option>
            {PLATFORMS.map((p) => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="video-url">
            Video URL <span className="req">*</span>
          </label>
          <input
            id="video-url"
            type="url"
            className="input"
            placeholder={current?.placeholder ?? "Pick a platform first…"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">
        <button onClick={submit} disabled={busy} className="btn btn-primary shrink-0">
          {busy ? "Submitting…" : "Submit video"}
        </button>
        {current && <p className="help">Example: {current.example}</p>}
      </div>
      {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}
      {done && <p className="text-sm mt-3" style={{ color: "var(--accent)" }}>{done}</p>}
    </div>
  );
}
