import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, messages } from "@/lib/clients";
import PortalShell from "@/components/PortalShell";
import Thread from "@/components/Thread";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  const thread = await messages(session.userId);

  return (
    <PortalShell name={session.name || session.email} role={session.role} portalName={s.portal_name} completedSteps={await completedSteps(session.userId)} unread={0}>
      <div className="max-w-3xl mx-auto fade-up">
        <p className="eyebrow mb-3">Messages</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Your thread</h1>
        <p className="text-[var(--muted)] text-sm mb-8 max-w-xl">
          One thread, attached to your project, so whoever answers already has the context. For anything urgent, email {s.support_email}.
        </p>
        <Thread
          initial={thread.map((m) => ({ id: m.id, body: m.body, authorName: m.author_name, authorRole: m.author_role, createdAt: m.created_at }))}
          me={session.role}
          emptyLine="No messages yet. Ask us anything — scope, timing, a file you cannot find."
        />
      </div>
    </PortalShell>
  );
}
