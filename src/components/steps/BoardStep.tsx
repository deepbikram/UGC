"use client";

import DeliverablesBoard, { type BoardItem } from "../DeliverablesBoard";

export default function BoardStep({ items }: { items: BoardItem[] }) {
  return (
    <div>
      <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-6 max-w-xl">
        Anything sitting in <strong className="text-white font-medium">Waiting on you</strong> is blocking the next piece of work.
        Approving is one click; requesting changes sends it back with the reason you leave in Messages.
      </p>
      <DeliverablesBoard items={items} compact />
    </div>
  );
}
