import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { all, get } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import PortalShell from "@/components/PortalShell";
import StatusChip from "@/components/StatusChip";

export const dynamic = "force-dynamic";
export const metadata = { title: "Videos" };

const GROUPS = [
  { status: "review", title: "Awaiting review", blurb: "Submitted videos sitting with the team." },
  { status: "in_progress", title: "In progress", blurb: "Being worked on right now." },
  { status: "queued", title: "Submitted", blurb: "New submissions not yet reviewed." },
  { status: "approved", title: "Eligible", blurb: "Reviewed and counted as eligible." },
];

export default async function AdminWork() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = getSettings();
  const unread = get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = 0")?.n ?? 0;

  const rows = all<{ id: number; title: string; status: string; due_on: string; url: string; client_id: number; client: string; company: string }>(
    `SELECT d.id, d.title, d.status, d.due_on, d.url, u.id AS client_id, u.name AS client, u.company
     FROM deliverables d JOIN users u ON u.id = d.user_id
     WHERE u.status = 'active'
     ORDER BY d.due_on = '' , d.due_on, d.id`
  );

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <div className="max-w-4xl mx-auto fade-up">
        <p className="eyebrow mb-3">Admin</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Videos</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">Every submitted video across every active creator, in the order it needs attention.</p>

        {rows.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm font-medium">No videos yet.</p>
            <p className="help mt-1.5">Open a creator and add the first submission.</p>
          </div>
        ) : (
          <div className="space-y-9">
            {GROUPS.map((g) => {
              const items = rows.filter((r) => r.status === g.status);
              if (items.length === 0) return null;
              return (
                <section key={g.status}>
                  <div className="flex items-baseline gap-3 mb-1">
                    <h2 className="eyebrow">{g.title}</h2>
                    <span className="mono num">{items.length}</span>
                  </div>
                  <p className="help mb-3">{g.blurb}</p>
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="tbl">
                        <tbody>
                          {items.map((r) => (
                            <tr key={r.id}>
                              <td className="max-w-[300px]">
                                <p className="font-medium truncate">{r.title}</p>
                                <Link href={`/admin/clients/${r.client_id}?tab=deliverables`} className="text-xs text-[var(--muted)] hover:text-white transition-colors">
                                  {r.client}{r.company ? ` · ${r.company}` : ""}
                                </Link>
                              </td>
                              <td className="hidden sm:table-cell text-[var(--muted)] whitespace-nowrap">{r.due_on ? fmtDate(r.due_on) : "—"}</td>
                              <td className="text-right"><StatusChip status={r.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
