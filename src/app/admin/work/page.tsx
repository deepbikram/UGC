import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { all, get } from "@/lib/db";
import PortalShell from "@/components/PortalShell";
import AdminVideoReview, { type WorkRow } from "@/components/AdminVideoReview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Videos" };

export default async function AdminWork() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = await getSettings();
  const unread = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = false"))?.n ?? 0;

  // review_note needs the pending migration (see
  // supabase/migrations/20261030120000_rejected_status.sql); fall back to ""
  // until it is applied so this page never 500s.
  let rows: WorkRow[];
  try {
    rows = await all<WorkRow>(
      `SELECT d.id, d.title, d.status, d.due_on, d.url, d.kind, d.created_at, d.review_note, u.id AS client_id, u.name AS client, u.company
       FROM deliverables d JOIN users u ON u.id = d.user_id
       WHERE u.status = 'active'
       ORDER BY d.due_on NULLS LAST, d.id`
    );
  } catch {
    const plain = await all<Omit<WorkRow, "review_note">>(
      `SELECT d.id, d.title, d.status, d.due_on, d.url, d.kind, d.created_at, u.id AS client_id, u.name AS client, u.company
       FROM deliverables d JOIN users u ON u.id = d.user_id
       WHERE u.status = 'active'
       ORDER BY d.due_on NULLS LAST, d.id`
    );
    rows = plain.map((r) => ({ ...r, review_note: "" }));
  }

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <div className="max-w-4xl mx-auto fade-up">
        <p className="eyebrow mb-3">Admin</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Videos</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">Every submitted video across every active creator, in the order it needs attention. Click a row to see the platform, the link, and approve or reject it.</p>

        {rows.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm font-medium">No videos yet.</p>
            <p className="help mt-1.5">Submissions appear here once creators finish the earlier modules and paste links.</p>
          </div>
        ) : (
          <AdminVideoReview rows={rows} />
        )}
      </div>
    </PortalShell>
  );
}
