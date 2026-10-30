"use client";

import { useEffect, useRef, useState } from "react";
import type { Field, Form } from "@/lib/forms";
import { isFieldRequired, isFieldVisible } from "@/lib/forms";

type Values = Record<string, string | string[]>;

export default function FormStep({
  form,
  initial,
  status,
  onSubmitted,
}: {
  form: Form;
  initial: Values;
  status: string;
  onSubmitted: () => void;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(status !== "submitted");
  const firstRender = useRef(true);

  // Drafts save themselves; nobody should lose an intake to a closed tab.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!editing) return;
    setSaved("saving");
    const timer = setTimeout(async () => {
      await fetch(`/api/forms/${form.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values, submit: false }),
      }).catch(() => {});
      setSaved("saved");
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  function set(id: string, v: string | string[]) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function toggle(id: string, option: string) {
    const current = Array.isArray(values[id]) ? (values[id] as string[]) : [];
    set(id, current.includes(option) ? current.filter((o) => o !== option) : [...current, option]);
  }

  const visibleFields = form.fields.filter((f) => isFieldVisible(f, values));

  const missing = visibleFields.filter((f) => {
    if (!isFieldRequired(f, values)) return false;
    const v = values[f.id];
    return Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
  });

  async function submit() {
    setError("");
    if (missing.length > 0) {
      setError(`Still blank: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/forms/${form.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: values, submit: true }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not submit.");
    setEditing(false);
    onSubmitted();
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4 mb-5">
          <p className="text-xs text-[var(--muted)]">Submitted. You can still change an answer if something moves.</p>
          <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm shrink-0">Edit answers</button>
        </div>
        <dl className="space-y-px">
          {visibleFields.map((f) => {
            const v = values[f.id];
            const text = Array.isArray(v) ? v.join(", ") : String(v ?? "");
            return (
              <div key={f.id} className="py-3.5 border-t border-[var(--border)] last:border-b grid sm:grid-cols-[minmax(0,240px)_1fr] gap-x-6 gap-y-1">
                <dt className="text-[13px] text-[var(--muted)]">{f.label}</dt>
                <dd className="text-[13.5px] whitespace-pre-wrap">{text || <span className="text-[var(--faint)]">—</span>}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed max-w-xl">{form.intro}</p>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-5">
        {visibleFields.map((f) => (
          <FieldInput key={f.id} field={f} value={values[f.id]} onChange={set} onToggle={toggle} required={isFieldRequired(f, values)} />
        ))}
      </div>

      {error && <p className="text-sm text-[var(--danger)] mt-5">{error}</p>}

      <div className="flex items-center gap-3 mt-7 pt-5 hairline">
        <button onClick={submit} disabled={busy} className="btn btn-primary">
          {busy ? "Submitting…" : "Submit answers"}
        </button>
        <span className="mono">
          {saved === "saving" ? "Saving draft…" : saved === "saved" ? "Draft saved" : "Answers save as you type"}
        </span>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  onToggle,
  required,
}: {
  field: Field;
  value: string | string[] | undefined;
  onChange: (id: string, v: string) => void;
  onToggle: (id: string, option: string) => void;
  required?: boolean;
}) {
  const isRequired = required ?? field.required;
  const label = (
    <label className="label" htmlFor={field.id}>
      {field.label} {isRequired && <span className="req">*</span>}
    </label>
  );
  const span = field.half ? "" : "sm:col-span-2";

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className={span}>
        {label}
        <div className="flex flex-wrap gap-2 mt-1">
          {(field.options ?? []).map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(field.id, opt)}
                className="text-[12.5px] font-medium rounded-full px-3.5 py-1.5 border transition-all"
                style={
                  on
                    ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#17150f" }
                    : { background: "rgba(255,255,255,0.02)", borderColor: "var(--border)", color: "#c8c5bd" }
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
        {field.help && <p className="help">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={span}>
        {label}
        <select id={field.id} className="input" value={String(value ?? "")} onChange={(e) => onChange(field.id, e.target.value)}>
          <option value="">Choose one…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {field.help && <p className="help">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={span}>
        {label}
        <textarea id={field.id} className="input" placeholder={field.placeholder} value={String(value ?? "")} onChange={(e) => onChange(field.id, e.target.value)} />
        {field.help && <p className="help">{field.help}</p>}
      </div>
    );
  }

  return (
    <div className={span}>
      {label}
      <input
        id={field.id}
        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
        className="input"
        placeholder={field.placeholder}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.id, e.target.value)}
      />
      {field.help && <p className="help">{field.help}</p>}
    </div>
  );
}
