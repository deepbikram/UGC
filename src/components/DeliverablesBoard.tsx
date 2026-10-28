"use client";

import StatusChip from "./StatusChip";
import { fmtDate } from "@/lib/format";

export type BoardItem = { id: number; title: string; summary: string; status: string; url: string; dueOn: string };

const ORDER = ["review", "in_progress", "queued", "approved"] as const;
const GROUP_TITLE: Record<string, string> = {
  review: "Awaiting review",
  in_progress: "In progress",
  queued: "Submitted",
  approved: "Eligible",
};

// Read-only for creators: the Band9Prep team moves videos through review
// from the admin side. Creators see status here, never action it.
export default function DeliverablesBoard({ items, compact = false }: { items: BoardItem[]; compact?: boolean }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium">No videos submitted yet.</p>
        <p className="help mt-1.5 max-w-sm mx-auto">Your submitted videos will appear here with a live review status, so you never have to ask where something stands.</p>
      </div>
    );
  }

  const counts = ORDER.map((status) => ({ status, n: items.filter((i) => i.status === status).length }));

  return (
    <div>
      {!compact && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {counts.map(({ status, n }) => (
            <div key={status} className="card-flat px-4 py-3.5">
              <p className="eyebrow mb-1.5">{GROUP_TITLE[status]}</p>
              <p className="text-[1.5rem] font-bold num leading-none">{n}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {ORDER.map((status) => {
          const group = items.filter((i) => i.status === status);
          if (group.length === 0) return null;
          return (
            <section key={status}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="eyebrow">{GROUP_TITLE[status]}</h3>
                <span className="mono num">{group.length}</span>
              </div>
              <div className="space-y-2.5">
                {group.map((d) => (
                  <div
                    key={d.id}
                    className="card p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-start gap-4"
                    style={status === "review" ? { borderColor: "rgba(195,182,216,0.3)" } : undefined}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h4 className="text-[15px] font-semibold">{d.title}</h4>
                        <StatusChip status={d.status} />
                      </div>
                      {d.summary && <p className="text-[13px] text-[var(--muted)] leading-relaxed">{d.summary}</p>}
                      <div className="flex items-center gap-4 mt-2.5">
                        {d.dueOn && <span className="mono">Posted {fmtDate(d.dueOn)}</span>}
                        {d.url && (
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--accent)" }}>
                            Open video ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
