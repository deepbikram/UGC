import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { all, get } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import PortalShell from "@/components/PortalShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity" };

export default async function AdminActivity() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = await getSettings();
  const unread = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = false"))?.n ?? 0;

  const rows = await all<{ id: number; user_id: number | null; actor_name: string; actor_role: string; kind: string; summary: string; created_at: string; client: string | null }>(
    `SELECT a.*, u.name AS client FROM activity a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC, a.id DESC LIMIT 200`
  );

  // Group by calendar day so the feed reads like a log, not a wall.
  const days = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    days.set(key, [...(days.get(key) ?? []), r]);
  }

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <div className="max-w-3xl mx-auto fade-up">
        <p className="eyebrow mb-3">Admin</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Activity</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">Everything that has happened across every project, newest first.</p>

        {rows.length === 0 ? (
          <div className="card p-10 text-center"><p className="text-sm font-medium">Nothing yet.</p></div>
        ) : (
          <div className="space-y-8">
            {Array.from(days.entries()).map(([day, items]) => (
              <section key={day}>
                <h2 className="eyebrow mb-3">
                  {new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                </h2>
                <div className="card p-5">
                  <ul className="space-y-px">
                    {items.map((r) => (
                      <li key={r.id} className="flex items-baseline gap-3 py-2.5 border-t border-[var(--border)] first:border-t-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[-1px]" style={{ background: r.actor_role === "admin" ? "var(--accent-2)" : "#4d4c48" }} />
                        <span className="text-[13px] flex-1 min-w-0">
                          {r.client && (
                            <Link href={`/admin/clients/${r.user_id}`} className="font-medium hover:underline underline-offset-2">{r.client}</Link>
                          )}
                          {r.client ? " · " : ""}
                          <span className="text-[var(--muted)]">{r.summary}</span>
                        </span>
                        <span className="mono shrink-0">{fmtDateTime(r.created_at).split(",").pop()?.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
