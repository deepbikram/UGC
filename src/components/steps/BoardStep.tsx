"use client";

import Link from "next/link";

export default function BoardStep() {
  return (
    <div>
      <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-5 max-w-xl">
        Share the link of each video you publish with your campaign representative. Submitted videos appear in the Videos tab with a live review status.
      </p>
      <Link href="/deliverables" className="btn btn-ghost btn-sm">Open Videos tab →</Link>
    </div>
  );
}
