import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, files, unreadFor } from "@/lib/clients";
import PortalShell from "@/components/PortalShell";
import FilesView from "@/components/FilesView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Files" };

export default async function FilesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  const rows = (await files(session.userId)).map((f) => ({
    id: f.id,
    name: f.file_name,
    size: f.size,
    createdAt: f.created_at,
    mime: f.mime,
    category: f.category,
    fromUs: f.uploader_role === "admin",
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
