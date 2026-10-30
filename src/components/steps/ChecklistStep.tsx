"use client";

import { useEffect, useRef, useState } from "react";

export default function ChecklistStep({
  stepId,
  items,
  checked,
  disabled = false,
  onChange,
}: {
  stepId: string;
  items: string[];
  checked: boolean[];
  disabled?: boolean;
  onChange?: (next: boolean[]) => void;
}) {
  const [state, setState] = useState<boolean[]>(() => items.map((_, i) => Boolean(checked[i])));
  const [saving, setSaving] = useState(false);
  const firstRender = useRef(true);

  // Persist drafts; never auto-completes — the parent's Agree button submits.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (disabled) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/forms/${stepId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { items: state }, submit: false }),
      }).catch(() => {});
      setSaving(false);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const doneCount = state.filter(Boolean).length;

  function toggle(i: number) {
    if (disabled) return;
    const next = state.map((v, j) => (i === j ? !v : v));
    setState(next);
    onChange?.(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow">{doneCount} of {items.length} checked</span>
        {saving && <span className="mono">Saving…</span>}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={item}>
            <label className={`flex items-start gap-3 py-2.5 px-3 -mx-3 rounded-lg transition-colors ${disabled ? "opacity-70" : "cursor-pointer hover:bg-[var(--panel-2)]"}`}>
              <input
                type="checkbox"
                checked={state[i]}
                disabled={disabled}
                onChange={() => toggle(i)}
                className="mt-0.5 w-4 h-4 shrink-0"
              />
              <span className={`text-sm leading-relaxed ${state[i] ? "text-[var(--muted)] line-through" : ""}`}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
