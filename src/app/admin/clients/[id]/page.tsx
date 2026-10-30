import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, deliverables, files, formResponse, getUser, messages, notes } from "@/lib/clients";
import { all, get } from "@/lib/db";
import { JOURNEY } from "@/lib/journey";
import { FORMS } from "@/lib/forms";
import PortalShell from "@/components/PortalShell";
import AdminClientDetail from "@/components/AdminClientDetail";

export const dynamic = "force-dynamic";

export default async function AdminClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const { id } = await params;
  const { tab } = await searchParams;
  const client = await getUser(Number(id));
  if (!client || client.role !== "client") notFound();

  const s = await getSettings();
  const unread = (await get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE author_role = 'client' AND read_by_admin = false"))?.n ?? 0;

  const intake = await Promise.all(
    Object.values(FORMS).map(async (form) => {
      const saved = await formResponse(client.id, form.id);
      return { form, data: saved.data as Record<string, string | string[]>, status: saved.status, submittedAt: saved.submittedAt };
    })
  );

  const checklists = await Promise.all(
    JOURNEY.flatMap((m) => m.steps)
      .filter((st) => st.type === "checklist")
      .map(async (st) => ({
        stepId: st.id,
        title: st.title,
        items: st.checklist ?? [],
        checked: ((await formResponse(client.id, st.id)).data.items as boolean[]) ?? [],
      }))
  );

  return (
    <PortalShell name={session.name || session.email} role="admin" view="admin" portalName={s.portal_name} unread={unread}>
      <AdminClientDetail
        initialTab={tab}
        client={{
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          projectName: client.project_name,
          startsOn: client.starts_on,
          status: client.status,
          mustReset: client.must_reset,
          seenIntro: client.seen_intro,
          createdAt: client.created_at,
          lastSeenAt: client.last_seen_at,
        }}
        completed={await completedSteps(client.id)}
        journey={JOURNEY.map((m) => ({ slug: m.slug, title: m.title, steps: m.steps.map((st) => ({ id: st.id, title: st.title, type: st.type })) }))}
        intake={intake}
        checklists={checklists}
        deliverables={(await deliverables(client.id)).map((d) => ({
          id: d.id,
          title: d.title,
          summary: d.summary,
          kind: d.kind,
          status: d.status,
          url: d.url,
          dueOn: d.due_on,
          createdAt: d.created_at,
          reviewNote: d.review_note,
        }))}
        files={(await files(client.id)).map((f) => ({
          id: f.id,
          name: f.file_name,
          size: f.size,
          createdAt: f.created_at,
          category: f.category,
          fromUs: f.uploader_role === "admin",
          isLink: f.mime === "link",
          url: f.mime === "link" ? f.stored_name : "",
        }))}
        messages={(await messages(client.id)).map((m) => ({ id: m.id, body: m.body, authorName: m.author_name, authorRole: m.author_role, createdAt: m.created_at }))}
        notes={(await notes(client.id)).map((n) => ({ id: n.id, body: n.body, authorName: n.author_name, createdAt: n.created_at }))}
        activity={(await all<{ id: number; kind: string; summary: string; actor_name: string; created_at: string }>(
          "SELECT id, kind, summary, actor_name, created_at FROM activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 40",
          [client.id]
        )).map((a) => ({ id: a.id, kind: a.kind, summary: a.summary, actorName: a.actor_name, createdAt: a.created_at }))}
      />
    </PortalShell>
  );
}
