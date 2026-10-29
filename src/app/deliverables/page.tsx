import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, deliverables, unreadFor } from "@/lib/clients";
import PortalShell from "@/components/PortalShell";
import DeliverablesBoard from "@/components/DeliverablesBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "My videos" };

export default async function DeliverablesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  const items = (await deliverables(session.userId)).map((d) => ({
    id: d.id,
    title: d.title,
    summary: d.summary,
    status: d.status,
    url: d.url,
    dueOn: d.due_on,
  }));

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      completedSteps={await completedSteps(session.userId)}
      unread={await unreadFor(session.userId, "client")}
    >
      <div className="max-w-4xl mx-auto fade-up">
        <p className="eyebrow mb-3">My videos</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Submissions</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">
          Every video you have submitted, with its review status. Reported views stay labelled as reported until an admin reviews them — only reviewed eligible views at your confirmed rate count toward payouts.
        </p>
        <DeliverablesBoard items={items} />
      </div>
    </PortalShell>
  );
}
