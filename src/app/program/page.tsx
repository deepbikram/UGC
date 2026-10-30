import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { allFormResponses, deliverables, files, portalData } from "@/lib/clients";
import { ALL_STEPS, JOURNEY } from "@/lib/journey";
import { buildStepData } from "@/lib/stepData";
import PortalShell from "@/components/PortalShell";
import ModuleView from "@/components/ModuleView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Program guide" };

export default async function ProgramPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // ponytail: same 2-trip pattern as module pages, but for all sections at once
  const needsForms = ALL_STEPS.some((s) => s.type === "form" || s.type === "checklist");
  const needsFiles = ALL_STEPS.some((s) => s.type === "upload" || s.type === "handoff");
  const needsBoard = ALL_STEPS.some((s) => s.type === "board" || s.type === "handoff");
  const [shell, s, forms, fileRows, boardRows] = await Promise.all([
    portalData(session.userId),
    getSettings(),
    needsForms ? allFormResponses(session.userId) : Promise.resolve(new Map()),
    needsFiles ? files(session.userId) : Promise.resolve([]),
    needsBoard ? deliverables(session.userId) : Promise.resolve([]),
  ]);

  const done = shell.done;
  const vars = { portal: s.portal_name, email: s.support_email };
  const ctx = { forms, fileRows, boardRows, vars, settings: s, user: shell.user };
  const sections = await Promise.all(
    JOURNEY.map(async (mod) => ({ mod, stepData: await buildStepData(mod, ctx) }))
  );

  let offset = 0;

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      completedSteps={done}
      unread={shell.unread}
    >
      <div className="max-w-3xl mx-auto fade-up">
        <p className="eyebrow mb-3">Your program</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-3 title-grad leading-tight">Program guide</h1>
        <p className="text-[var(--muted)] text-[14.5px] leading-relaxed mb-10 max-w-2xl">
          Everything in one place — work through each section in order.
        </p>

        <div className="space-y-12">
          {sections.map(({ mod, stepData }) => {
            const el = (
              <section key={mod.slug} id={mod.slug} className="scroll-mt-6">
                <ModuleView
                  module={mod}
                  index={JOURNEY.indexOf(mod)}
                  completed={done}
                  stepData={stepData}
                  prev={null}
                  next={null}
                  nextUnlocked={false}
                  numberOffset={offset}
                  hideFooterNav
                />
              </section>
            );
            offset += mod.steps.length;
            return el;
          })}
        </div>
      </div>
    </PortalShell>
  );
}
