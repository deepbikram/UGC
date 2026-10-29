import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SETTINGS_SCHEMA } from "@/lib/brand";
import { get } from "@/lib/db";
import PortalShell from "@/components/PortalShell";
import AdminSettings from "@/components/AdminSettings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = await getSettings();
  const unread = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = false"))?.n ?? 0;

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <AdminSettings
        groups={SETTINGS_SCHEMA.map((g) => ({
          group: g.group,
          keys: g.keys.map((k) => ({ key: k.key, label: k.label, help: k.help, type: "type" in k ? (k.type as string) : "text" })),
        }))}
        values={s}
      />
    </PortalShell>
  );
}
