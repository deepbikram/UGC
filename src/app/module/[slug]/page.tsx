import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { allFormResponses, deliverables, files, portalData } from "@/lib/clients";
import { JOURNEY, getModule, isModuleUnlocked } from "@/lib/journey";
import { buildStepData } from "@/lib/stepData";
import PortalShell from "@/components/PortalShell";
import ModuleView from "@/components/ModuleView";

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

  // ponytail: 1 shell trip (user+steps+unread) + cached settings, then at most
  // 1 trip each for forms/files/deliverables — all fired together
  const needsForms = mod.steps.some((s) => s.type === "form" || s.type === "checklist");
  const needsFiles = mod.steps.some((s) => s.type === "upload" || s.type === "handoff");
  const needsBoard = mod.steps.some((s) => s.type === "board" || s.type === "handoff");
  const [shell, s, forms, fileRows, boardRows] = await Promise.all([
    portalData(session.userId),
    getSettings(),
    needsForms ? allFormResponses(session.userId) : Promise.resolve(new Map()),
    needsFiles ? files(session.userId) : Promise.resolve([]),
    needsBoard ? deliverables(session.userId) : Promise.resolve([]),
  ]);

  const done = shell.done;
  const completed = new Set(done);
  const index = JOURNEY.findIndex((m) => m.slug === slug);
  if (session.role !== "admin" && !isModuleUnlocked(index, completed)) redirect("/");

  const stepData = await buildStepData(mod, {
    forms,
    fileRows,
    boardRows,
    vars: { portal: s.portal_name, email: s.support_email },
    settings: s,
    user: shell.user,
  });

  const prev = index > 0 ? JOURNEY[index - 1] : null;
  const next = index < JOURNEY.length - 1 ? JOURNEY[index + 1] : null;

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      completedSteps={done}
      unread={shell.unread}
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
