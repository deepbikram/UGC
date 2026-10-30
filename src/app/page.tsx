import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getUser, completedSteps, deliverables, unreadFor } from "@/lib/clients";
import { journeyStats } from "@/lib/journey";
import { fmtDate, timeAgo } from "@/lib/format";
import PortalShell from "@/components/PortalShell";
import StatusChip from "@/components/StatusChip";

export const dynamic = "force-dynamic";

const PLATFORM: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};

export default async function Overview() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUser(session.userId);
  if (session.role === "client" && user && user.seen_intro === false) redirect("/onboarding");

  const s = await getSettings();
  const done = await completedSteps(session.userId);
  const completed = new Set(done);
  const stats = journeyStats(completed, session.role === "admin");
  const board = await deliverables(session.userId);
  const unread = await unreadFor(session.userId, "client");

  const firstName = (session.name || "").split(" ")[0];
  const total = board.length;
  const approved = board.filter((d) => d.status === "approved");
  const rejected = board.filter((d) => d.status === "rejected");
  const pending = board.filter((d) => d.status === "review" || d.status === "queued" || d.status === "in_progress");

  // Past payouts: no separate payouts table yet — approved (eligible) videos
  // are what monthly payouts are calculated from. Newest approval first.
  const payouts = [...approved].sort((a, b) =>
    String(b.approved_at ?? b.created_at).localeCompare(String(a.approved_at ?? a.created_at))
  );
  const recent = [...pending].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);

  const kpis = [
    { label: "Submitted videos", value: String(total) },
    { label: "Approved", value: String(approved.length) },
    { label: "In review", value: String(pending.length) },
    { label: "Rejected", value: String(rejected.length) },
  ];

  return (
    <PortalShell name={session.name || session.email} role={session.role} portalName={s.portal_name} completedSteps={done} unread={unread}>
      <div className="max-w-5xl mx-auto fade-up">
        <p className="eyebrow mb-3">{user?.project_name || user?.company || "Creator overview"}</p>
        <h1 className="text-[2.1rem] lg:text-4xl font-bold mb-2 title-grad">Welcome{firstName ? `, ${firstName}` : ""}.</h1>
        <p className="text-[var(--muted)] text-sm mb-7">
          Every video you submit, where it stands in review, and what counts toward payouts — in one place.
        </p>

        {/* Video KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 stagger">
          {kpis.map((k) => (
            <div key={k.label} className="card-flat px-4 py-3.5">
              <p className="eyebrow mb-1.5">{k.label}</p>
              <p className="text-[1.5rem] font-bold num leading-none">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Pending nudge */}
        {pending.length > 0 && (
          <div className="card px-5 py-4 mb-4 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: "rgba(216,207,192,0.34)", background: "rgba(216,207,192,0.045)" }}>
            <div>
              <p className="text-sm font-medium">
                {pending.length} video{pending.length > 1 ? "s are" : " is"} sitting with the review team.
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Reported views stay labelled as reported until an admin reviews them — only reviewed eligible views count toward payouts.
              </p>
            </div>
            <Link href="/deliverables" className="btn btn-light btn-sm shrink-0">
              Track in My videos
            </Link>
          </div>
        )}
        {unread > 0 && (
          <div className="card px-5 py-4 mb-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium">You have {unread} unread message{unread > 1 ? "s" : ""}.</p>
            <Link href="/messages" className="btn btn-light btn-sm shrink-0">Open messages</Link>
          </div>
        )}

        {/* Continue journey (compact) */}
        {!stats.complete && stats.nextModule && (
          <div className="card px-5 py-4 mb-8 flex flex-wrap items-center gap-5">
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-baseline justify-between mb-2">
                <span className="eyebrow">Overall progress</span>
                <span className="text-sm font-semibold num">{stats.done}/{stats.total} steps · {stats.pct}%</span>
              </div>
              <div className="bar">
                <div className={`bar-fill ${stats.pct === 100 ? "bar-fill-done" : ""}`} style={{ width: `${stats.pct}%` }} />
              </div>
            </div>
            <Link href={`/module/${stats.nextModule.slug}`} className="btn btn-primary shrink-0">
              Continue: {stats.nextModule.title} →
            </Link>
          </div>
        )}

        {/* Videos in review */}
        <div className="card p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="eyebrow">Videos in review · {pending.length}</h2>
            <Link href="/deliverables" className="text-xs text-[var(--muted)] hover:text-white transition-colors">My videos →</Link>
          </div>
          {pending.length === 0 ? (
            <div>
              <p className="text-sm font-medium">No videos in review.</p>
              <p className="text-[13px] text-[var(--muted)] mt-1 mb-4">Paste your first TikTok, Reels, or Shorts link and it will show up here with a live review status.</p>
              <Link href="/deliverables" className="btn btn-primary btn-sm">Submit a video</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((d) => (
                <li key={d.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {PLATFORM[d.kind] ?? d.kind} · {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2" style={{ color: "var(--accent)" }}>Open ↗</a> : "No link"} · {timeAgo(d.created_at)}
                    </p>
                  </div>
                  <StatusChip status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Past payouts — only when there is something to show */}
        <div className="card p-5 mt-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="eyebrow">Past payouts {payouts.length > 0 ? `· ${payouts.length}` : ""}</h2>
          </div>
          {payouts.length === 0 ? (
            <div>
              <p className="text-sm font-medium">No payouts yet.</p>
              <p className="text-[13px] text-[var(--muted)] mt-1 leading-relaxed">
                Payouts are calculated monthly as <span className="text-neutral-200">eligible views / 1,000 × your confirmed rate</span>.
                Once videos are approved, they appear here as payout-eligible.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-[var(--muted)] mb-4 leading-relaxed">
                Approved videos below count toward monthly payouts at your confirmed rate. Amounts are finalised at monthly review.
              </p>
              <ul className="space-y-px">
                {payouts.slice(0, 6).map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-3 border-t border-[var(--border)] last:border-b">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {PLATFORM[d.kind] ?? d.kind} · {d.approved_at ? `Approved ${fmtDate(d.approved_at)}` : `Submitted ${fmtDate(d.created_at)}`}
                      </p>
                    </div>
                    <span className="chip chip-done shrink-0">Eligible</span>
                  </li>
                ))}
              </ul>
              {payouts.length > 6 && (
                <p className="text-xs text-[var(--muted)] mt-3">+ {payouts.length - 6} more eligible video{payouts.length - 6 > 1 ? "s" : ""} — see My videos for the full list.</p>
              )}
            </div>
          )}
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
