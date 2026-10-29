import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, getUser, unreadFor } from "@/lib/clients";
import { fmtDate } from "@/lib/format";
import PortalShell from "@/components/PortalShell";
import AccountForm from "@/components/AccountForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  const user = await getUser(session.userId);
  const isClient = session.role === "client";

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      view={isClient ? "client" : "admin"}
      completedSteps={await completedSteps(session.userId)}
      unread={isClient ? await unreadFor(session.userId, "client") : 0}
    >
      <div className="max-w-xl mx-auto fade-up">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="text-[2rem] font-bold mb-8 title-grad">Your details</h1>

        <div className="card p-5 mb-4">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Email</dt>
              <dd className="truncate">{session.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Role</dt>
              <dd className="capitalize">{session.role}</dd>
            </div>
            {user?.company && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Company</dt>
                <dd className="truncate">{user.company}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Member since</dt>
              <dd>{fmtDate(user?.created_at)}</dd>
            </div>
          </dl>
        </div>

        <AccountForm name={session.name} />
      </div>
    </PortalShell>
  );
}
