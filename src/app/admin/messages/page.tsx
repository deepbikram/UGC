import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { all, get } from "@/lib/db";
import { initials, timeAgo } from "@/lib/format";
import PortalShell from "@/components/PortalShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function AdminMessages() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = getSettings();
  const unread = get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = 0")?.n ?? 0;

  const threads = all<{ user_id: number; client: string; company: string; body: string; author_role: string; created_at: string; unread: number }>(
    `SELECT u.id AS user_id, u.name AS client, u.company,
            m.body, m.author_role, m.created_at,
            (SELECT COUNT(*) FROM messages x WHERE x.user_id = u.id AND x.author_role = 'client' AND x.read_by_admin = 0) AS unread
     FROM users u
     LEFT JOIN messages m ON m.id = (SELECT id FROM messages WHERE user_id = u.id ORDER BY created_at DESC, id DESC LIMIT 1)
     WHERE u.role = 'client' AND u.status = 'active'
     ORDER BY unread DESC, m.created_at DESC NULLS LAST, u.name`
  );

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <div className="max-w-3xl mx-auto fade-up">
        <p className="eyebrow mb-3">Admin</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Inbox</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">One thread per creator. Unread first.</p>

        {threads.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm font-medium">No creators yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5 stagger">
            {threads.map((t) => (
              <Link key={t.user_id} href={`/admin/clients/${t.user_id}?tab=messages`} className="card card-hover p-4 flex items-center gap-4 block">
                <span className="w-9 h-9 rounded-full bg-[var(--panel-hi)] border border-[var(--border)] flex items-center justify-center text-[11px] font-semibold shrink-0">
                  {initials(t.client)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5">
                    <p className="text-[14.5px] font-semibold truncate">{t.client}</p>
                    {t.company && <span className="mono truncate">{t.company}</span>}
                  </div>
                  <p className="text-[13px] text-[var(--muted)] truncate mt-0.5">
                    {t.body ? `${t.author_role === "admin" ? "You: " : ""}${t.body}` : "No messages yet"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {t.unread > 0 && (
                    <span className="num text-[10.5px] font-bold rounded-full px-1.5 py-0.5" style={{ background: "var(--accent)", color: "#17150f" }}>
                      {t.unread}
                    </span>
                  )}
                  <p className="mono mt-1">{t.created_at ? timeAgo(t.created_at) : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
