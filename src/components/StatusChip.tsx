// Board statuses, relabelled for the creator program. Stored values are
// unchanged (no migration); only the displayed words differ.
const LABELS: Record<string, { label: string; cls: string }> = {
  queued: { label: "Submitted", cls: "chip-todo" },
  in_progress: { label: "In progress", cls: "chip-progress" },
  review: { label: "Awaiting review", cls: "chip-review" },
  approved: { label: "Eligible", cls: "chip-done" },
  rejected: { label: "Rejected", cls: "chip-danger" },
};

export const DELIVERABLE_STATUSES = ["queued", "in_progress", "review", "approved", "rejected"] as const;

export function statusLabel(status: string): string {
  return LABELS[status]?.label ?? status;
}

export default function StatusChip({ status }: { status: string }) {
  const meta = LABELS[status] ?? { label: status, cls: "chip-todo" };
  return <span className={`chip ${meta.cls} shrink-0`}>{meta.label}</span>;
}
