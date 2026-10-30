import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { completedSteps, deliverables, unreadFor } from "@/lib/clients";
import { JOURNEY, blockingModuleTitle, isModuleUnlocked } from "@/lib/journey";
import { getContentVideos, PLATFORM_LABEL } from "@/lib/content";
import PortalShell from "@/components/PortalShell";
import DeliverablesBoard from "@/components/DeliverablesBoard";
import VideoSubmitForm from "@/components/VideoSubmitForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My videos" };

export default async function DeliverablesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  const done = await completedSteps(session.userId);
  const completed = new Set(done);
  const items = (await deliverables(session.userId)).map((d) => ({
    id: d.id,
    title: d.title,
    summary: d.summary,
    status: d.status,
    url: d.url,
    dueOn: d.due_on,
    reviewNote: d.review_note,
  }));

  // Link uploads unlock once the journey content before Videos is finished.
  const videosIndex = JOURNEY.findIndex((m) => m.slug === "videos");
  const uploadsUnlocked =
    session.role === "admin" || videosIndex < 0 || isModuleUnlocked(videosIndex, completed);
  const blocker = !uploadsUnlocked ? blockingModuleTitle(videosIndex, completed) : null;
  const library = await getContentVideos();

  return (
    <PortalShell
      name={session.name || session.email}
      role={session.role}
      portalName={s.portal_name}
      completedSteps={done}
      unread={await unreadFor(session.userId, "client")}
    >
      <div className="max-w-4xl mx-auto fade-up">
        <p className="eyebrow mb-3">My videos</p>
        <h1 className="text-[2rem] lg:text-[2.4rem] font-bold mb-2 title-grad">Submissions</h1>
        <p className="text-[var(--muted)] text-sm mb-9 max-w-xl">
          Every video you have submitted, with its review status. Reported views stay labelled as reported until an admin reviews them — only reviewed eligible views at your confirmed rate count toward payouts.
        </p>
        {uploadsUnlocked ? (
          <VideoSubmitForm />
        ) : (
          <div className="card-flat p-4 sm:p-5 mb-8">
            <p className="text-sm font-medium">Video uploads unlock after the earlier modules.</p>
            <p className="help mt-1.5">
              {blocker ? `Finish “${blocker}” first — then you can paste TikTok links here.` : "Finish the earlier modules first — then you can paste TikTok links here."}
            </p>
          </div>
        )}
        <DeliverablesBoard items={items} />
        {library.length > 0 && (
          <section className="mt-10">
            <h2 className="eyebrow mb-1">From Band9Prep</h2>
            <p className="help mb-3">Watch what good looks like before you film.</p>
            <div className="space-y-2.5">
              {library.map((v) => (
                <div key={v.id} className="card p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-semibold">{v.title}</h4>
                    <p className="mono mt-1">{PLATFORM_LABEL[v.kind]}</p>
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--accent)" }}>
                      Open video ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PortalShell>
  );
}
