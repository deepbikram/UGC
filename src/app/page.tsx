import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getUser, completedSteps, deliverables, files, messages, unreadFor } from "@/lib/clients";
import { JOURNEY, blockingModuleTitle, isModuleUnlocked, journeyStats } from "@/lib/journey";
import { fmtDate, timeAgo } from "@/lib/format";
import PortalShell from "@/components/PortalShell";
import StatusChip from "@/components/StatusChip";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = getUser(session.userId);
  if (session.role === "client" && user && user.seen_intro === 0) redirect("/intro");

  const s = getSettings();
  const done = completedSteps(session.userId);
  const completed = new Set(done);
  const stats = journeyStats(completed, session.role === "admin");
  const board = deliverables(session.userId);
  const thread = messages(session.userId);
  const unread = unreadFor(session.userId, "client");
  const fileCount = files(session.userId).length;

  const firstName = (session.name || "").split(" ")[0];
  const inReview = board.filter((d) => d.status === "review");
  const lastMessage = thread[thread.length - 1];

  const kpis = [
    { label: "Steps done", value: `${stats.done}/${stats.total}` },
    { label: "Deliverables", value: String(board.length) },
    { label: "Awaiting you", value: String(inReview.length) },
    { label: "Files", value: String(fileCount) },
  ];

  return (
    <PortalShell name={session.name || session.email} role={session.role} portalName={s.portal_name} completedSteps={done} unread={unread}>
      <div className="max-w-5xl mx-auto fade-up">
        <p className="eyebrow mb-3">{user?.project_name || user?.company || "Client portal"}</p>
        <h1 className="text-[2.1rem] lg:text-4xl font-bold mb-2 title-grad">Welcome{firstName ? `, ${firstName}` : ""}.</h1>
        <p className="text-[var(--muted)] text-sm mb-7">
          {stats.complete
            ? "Everything is finished. The handoff pack is yours to keep."
            : "Work through each module in order. The next one unlocks as you finish the one before it."}
        </p>

        {/* Progress + continue */}
        <div className="card px-5 py-4 mb-4 flex flex-wrap items-center gap-5">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="eyebrow">Overall progress</span>
              <span className="text-sm font-semibold num">{stats.done}/{stats.total} steps · {stats.pct}%</span>
            </div>
            <div className="bar">
              <div className={`bar-fill ${stats.pct === 100 ? "bar-fill-done" : ""}`} style={{ width: `${stats.pct}%` }} />
            </div>
          </div>
          {stats.nextModule ? (
            <Link href={`/module/${stats.nextModule.slug}`} className="btn btn-primary shrink-0">
              Continue: {stats.nextModule.title} →
            </Link>
          ) : (
            <span className="chip chip-done shrink-0">All modules complete</span>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 stagger">
          {kpis.map((k) => (
            <div key={k.label} className="card-flat px-4 py-3.5">
              <p className="eyebrow mb-1.5">{k.label}</p>
              <p className="text-[1.5rem] font-bold num leading-none">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Things waiting on the client */}
        {(inReview.length > 0 || unread > 0) && (
          <div className="card px-5 py-4 mb-8 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: "rgba(216,207,192,0.34)", background: "rgba(216,207,192,0.045)" }}>
            <div>
              <p className="text-sm font-medium">
                {inReview.length > 0
                  ? `${inReview.length} deliverable${inReview.length > 1 ? "s are" : " is"} waiting on your review.`
                  : `You have ${unread} unread message${unread > 1 ? "s" : ""}.`}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {inReview.length > 0 ? inReview.map((d) => d.title).join(" · ") : "The fastest way to keep a project moving is to answer it."}
              </p>
            </div>
            <Link href={inReview.length > 0 ? "/deliverables" : "/messages"} className="btn btn-light btn-sm shrink-0">
              {inReview.length > 0 ? "Review now" : "Open messages"}
            </Link>
          </div>
        )}

        {/* Modules */}
        <h2 className="eyebrow mb-3 mt-9">Your journey</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 stagger">
          {JOURNEY.map((mod, i) => {
            const modDone = mod.steps.filter((st) => completed.has(st.id)).length;
            const pct = mod.steps.length ? Math.round((modDone / mod.steps.length) * 100) : 0;
            const unlocked = session.role === "admin" || isModuleUnlocked(i, completed);
            const isComplete = mod.steps.length > 0 && modDone === mod.steps.length;
            const isNext = i === stats.nextIndex;
            const blocker = unlocked ? null : blockingModuleTitle(i, completed);

            const card = (
              <div className={`h-full rounded-[14px] p-5 flex flex-col border ${unlocked ? `card card-hover ${isNext ? "up-next" : ""}` : "bg-[#0e0e0d] border-[#1b1b19]"}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`mono ${unlocked ? "" : "opacity-50"}`}>{String(i + 1).padStart(2, "0")}</span>
                  {!unlocked ? (
                    <span className="chip chip-todo">Locked</span>
                  ) : isComplete ? (
                    <span className="chip chip-done">Complete</span>
                  ) : isNext ? (
                    <span className="chip chip-next">Up next</span>
                  ) : modDone > 0 ? (
                    <span className="chip chip-progress">In progress</span>
                  ) : (
                    <span className="chip chip-todo">Open</span>
                  )}
                </div>
                <h3 className={`font-semibold text-[16.5px] mb-1.5 ${unlocked ? "" : "text-neutral-600"}`}>{mod.title}</h3>
                <p className={`text-[13px] leading-relaxed mb-4 flex-1 ${unlocked ? "text-[var(--muted)]" : "text-neutral-700"}`}>{mod.description}</p>
                {unlocked ? (
                  <div>
                    <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5 num">
                      <span>{modDone}/{mod.steps.length} steps</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="bar bar-thin">
                      <div className={`bar-fill ${isComplete ? "bar-fill-done" : ""}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ) : (
                  blocker && <p className="text-xs text-neutral-600">Finish “{blocker}” to unlock.</p>
                )}
              </div>
            );

            return unlocked ? (
              <Link key={mod.slug} href={`/module/${mod.slug}`}>{card}</Link>
            ) : (
              <div key={mod.slug}>{card}</div>
            );
          })}
        </div>

        {/* Recent */}
        <div className="grid lg:grid-cols-2 gap-3.5 mt-9">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="eyebrow">Latest deliverables</h2>
              <Link href="/deliverables" className="text-xs text-[var(--muted)] hover:text-white transition-colors">View board →</Link>
            </div>
            {board.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nothing on the board yet. Deliverables appear here as soon as the work starts.</p>
            ) : (
              <ul className="space-y-3">
                {board.slice(0, 4).map((d) => (
                  <li key={d.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-[var(--muted)]">{d.due_on ? `Due ${fmtDate(d.due_on)}` : `Added ${timeAgo(d.created_at)}`}</p>
                    </div>
                    <StatusChip status={d.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="eyebrow">Messages</h2>
              <Link href="/messages" className="text-xs text-[var(--muted)] hover:text-white transition-colors">Open thread →</Link>
            </div>
            {!lastMessage ? (
              <p className="text-sm text-[var(--muted)]">No messages yet. Anything you need, ask here — it is threaded to your project.</p>
            ) : (
              <div>
                <p className="text-xs text-[var(--muted)] mb-1.5">
                  {lastMessage.author_name} · {timeAgo(lastMessage.created_at)}
                </p>
                <p className="text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">{lastMessage.body.slice(0, 280)}</p>
              </div>
            )}
          </div>
        </div>

        {s.resources_url && (
          <a href={s.resources_url} target="_blank" rel="noopener noreferrer" className="card card-hover p-5 mt-3.5 block">
            <p className="eyebrow mb-1.5">Shared resources</p>
            <p className="text-sm font-medium">Open the shared workspace →</p>
          </a>
        )}
      </div>
    </PortalShell>
  );
}
