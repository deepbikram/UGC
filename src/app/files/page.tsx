import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { portalData } from "@/lib/clients";
import { all, type FileRow } from "@/lib/db";
import PortalShell from "@/components/PortalShell";
import FilesView from "@/components/FilesView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content" };

export default async function FilesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // ponytail: shell (user+steps+unread) + files in 2 trips, settings cached
  const [shell, fileRows] = await Promise.all([
    portalData(session.userId),
    all<FileRow>(
      "SELECT * FROM files WHERE user_id = ? OR uploader_role = 'admin' ORDER BY created_at DESC",
      [session.userId]
    ),
  ]);
  const s = await getSettings();
  const rows = fileRows.map((f) => ({
    id: f.id,
    name: f.file_name,
    size: f.size,
    createdAt: f.created_at,
    mime: f.mime,
    category: f.category,
    fromUs: f.uploader_role === "admin",
    isLink: f.mime === "link",
    url: f.mime === "link" ? f.stored_name : "",
  }));

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      completedSteps={shell.done}
      unread={shell.unread}
    >
      <FilesView initial={rows} portalName={s.portal_name} />
    </PortalShell>
  );
}
