import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, unreadFor } from "@/lib/clients";
import { all, type FileRow } from "@/lib/db";
import PortalShell from "@/components/PortalShell";
import FilesView from "@/components/FilesView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content" };

export default async function FilesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  // Your own uploads plus everything the admin shared — admin content is
  // visible to every creator, so it is not scoped to one user.
  const rows = (
    await all<FileRow>(
      "SELECT * FROM files WHERE user_id = ? OR uploader_role = 'admin' ORDER BY created_at DESC",
      [session.userId]
    )
  ).map((f) => ({
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
      completedSteps={await completedSteps(session.userId)}
      unread={await unreadFor(session.userId, "client")}
    >
      <FilesView initial={rows} portalName={s.portal_name} />
    </PortalShell>
  );
}
