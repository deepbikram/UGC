import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { attention, clientSummaries } from "@/lib/clients";
import { get } from "@/lib/db";
import PortalShell from "@/components/PortalShell";
import AdminClients from "@/components/AdminClients";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creators" };

export default async function AdminHome() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const s = getSettings();
  const clients = clientSummaries(true);
  const unread = get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = 0")?.n ?? 0;

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <AdminClients clients={clients} attention={attention(clients.filter((c) => c.status === "active"))} />
    </PortalShell>
  );
}
