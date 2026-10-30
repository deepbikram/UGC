import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { get } from "@/lib/db";
import { getContentVideos } from "@/lib/content";
import PortalShell from "@/components/PortalShell";
import AdminContentForm from "@/components/AdminContentForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content" };

export default async function AdminContent() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = await getSettings();
  const unread = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = false"))?.n ?? 0;

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <div className="max-w-2xl mx-auto fade-up">
        <p className="eyebrow mb-3">Admin</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Content</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">
          Video library for every creator. The platform is detected from the link automatically.
        </p>
        <div className="card p-5 sm:p-6">
          <AdminContentForm initial={await getContentVideos()} />
        </div>
      </div>
    </PortalShell>
  );
}
