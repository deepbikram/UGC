"use client";

import { useState } from "react";
import Uploader from "../Uploader";
import type { StepFile } from "@/lib/stepData";

export default function UploadStep({
  category,
  asks,
  initialFiles,
  onUploaded,
}: {
  category: string;
  asks: string[];
  initialFiles: StepFile[];
  onUploaded: () => void;
}) {
  const [files, setFiles] = useState<StepFile[]>(initialFiles);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8">
      <div>
        <Uploader
          category={category}
          files={files}
          onChange={(next) => {
            const gained = next.length > files.length;
            setFiles(next);
            if (gained) onUploaded();
          }}
        />
      </div>
      <aside>
        <p className="eyebrow mb-3">What we are after</p>
        <ul className="space-y-2.5">
          {asks.map((ask) => (
            <li key={ask} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--muted)]">
              <span className="mt-[7px] w-1 h-1 rounded-full shrink-0" style={{ background: "var(--accent-2)" }} />
              {ask}
            </li>
          ))}
        </ul>
        <p className="help mt-4">Missing something? Upload what you have — we will chase the rest.</p>
      </aside>
    </div>
  );
}
