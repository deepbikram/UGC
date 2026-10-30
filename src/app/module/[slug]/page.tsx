import { notFound, redirect } from "next/navigation";
import { marked } from "marked";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, deliverables, files, formResponse, getUser, unreadFor } from "@/lib/clients";
import { JOURNEY, getModule, isModuleUnlocked } from "@/lib/journey";
import { DOCS, renderDoc } from "@/lib/docs";
import { FORMS } from "@/lib/forms";
import PortalShell from "@/components/PortalShell";
import ModuleView, { type StepData } from "@/components/ModuleView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getModule(slug)?.title ?? "Module" };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const index = JOURNEY.findIndex((m) => m.slug === slug);
  const done = await completedSteps(session.userId);
  const completed = new Set(done);
  if (session.role !== "admin" && !isModuleUnlocked(index, completed)) redirect("/");

  const s = await getSettings();
  const user = await getUser(session.userId);

  // Everything each step needs, resolved on the server so the client component
  // stays a pure renderer.
  const stepData: Record<string, StepData> = {};
  for (const step of mod.steps) {
    if (step.type === "doc" && step.doc) {
      const doc = DOCS[step.doc];
      stepData[step.id] = doc
        ? { kind: "doc", title: doc.title, minutes: doc.minutes, html: await marked.parse(renderDoc(doc.body, { portal: s.portal_name, email: s.support_email })) }
        : { kind: "doc", title: step.title, minutes: 1, html: "" };
    } else if (step.type === "form" && step.form) {
      const form = FORMS[step.form];
      const saved = await formResponse(session.userId, step.form);
      stepData[step.id] = { kind: "form", form, data: saved.data as Record<string, string | string[]>, status: saved.status, updatedAt: saved.updatedAt };
    } else if (step.type === "upload" && step.upload) {
      stepData[step.id] = {
        kind: "upload",
        category: step.upload.category,
        asks: step.upload.asks,
        files: (await files(session.userId, step.upload.category)).map((f) => ({ id: f.id, name: f.file_name, size: f.size, createdAt: f.created_at, mime: f.mime })),
      };
    } else if (step.type === "checklist" && step.checklist) {
      const saved = await formResponse(session.userId, step.id);
      stepData[step.id] = { kind: "checklist", items: step.checklist, checked: (saved.data.items as boolean[]) ?? [] };
    } else if (step.type === "action" && step.action) {
      const url = step.action.url || (step.action.settingKey ? s[step.action.settingKey] ?? "" : "");
      stepData[step.id] = { kind: "action", label: step.action.label, url, note: step.action.note ?? "" };
    } else if (step.type === "board") {
      stepData[step.id] = {
        kind: "board",
        items: (await deliverables(session.userId)).map((d) => ({ id: d.id, title: d.title, summary: d.summary, status: d.status, url: d.url, dueOn: d.due_on, reviewNote: d.review_note })),
      };
    } else if (step.type === "handoff") {
      stepData[step.id] = {
        kind: "handoff",
        intro: await marked.parse(DOCS.handoff.body),
        deliverables: (await deliverables(session.userId)).map((d) => ({ id: d.id, title: d.title, status: d.status, url: d.url })),
        files: (await files(session.userId)).map((f) => ({ id: f.id, name: f.file_name, size: f.size, category: f.category, url: f.mime === "link" ? f.stored_name : "" })),
        supportEmail: s.support_email,
        projectName: user?.project_name || user?.company || "",
        clientName: user?.name || "",
        portalName: s.portal_name,
      };
    }
  }

  const prev = index > 0 ? JOURNEY[index - 1] : null;
  const next = index < JOURNEY.length - 1 ? JOURNEY[index + 1] : null;

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      completedSteps={done}
      unread={await unreadFor(session.userId, "client")}
    >
      <ModuleView
        module={mod}
        index={index}
        completed={done}
        stepData={stepData}
        prev={prev ? { slug: prev.slug, title: prev.title } : null}
        next={next ? { slug: next.slug, title: next.title } : null}
        nextUnlocked={session.role === "admin" || isModuleUnlocked(index + 1, completed)}
      />
    </PortalShell>
  );
}
