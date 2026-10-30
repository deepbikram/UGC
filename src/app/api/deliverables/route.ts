import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { get, logActivity, run, type Deliverable } from "@/lib/db";
import { completedSteps } from "@/lib/clients";
import { JOURNEY, isModuleUnlocked, blockingModuleTitle } from "@/lib/journey";

/** Creators submit their published video URLs from the Videos tab once
 *  they have finished everything before the Videos module. Submissions land
 *  in review; admins review from the admin side. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { url, title = "", platform = "", userId } = await req.json().catch(() => ({}));
  const cleanUrl = String(url ?? "").trim().slice(0, 500);
  if (!cleanUrl) return NextResponse.json({ error: "Paste your video URL." }, { status: 400 });

  // Platform is compulsory; the URL must look like it belongs to it.
  const KINDS: Record<string, { kind: string; hosts: RegExp; label: string }> = {
    "TikTok": { kind: "tiktok", hosts: /tiktok\.com/i, label: "TikTok" },
    "Instagram Reels": { kind: "instagram", hosts: /instagram\.com/i, label: "Instagram" },
    "YouTube Shorts": { kind: "youtube", hosts: /(youtube\.com|youtu\.be)/i, label: "YouTube" },
  };
  const chosen = KINDS[String(platform ?? "")];
  if (!chosen) return NextResponse.json({ error: "Choose the platform you uploaded on." }, { status: 400 });
  if (!chosen.hosts.test(cleanUrl)) {
    return NextResponse.json({ error: `That does not look like a ${chosen.label} URL.` }, { status: 400 });
  }

  // Creators submit for themselves; admins may submit on a client's behalf.
  const targetId = session.role === "admin" && userId ? Number(userId) : session.userId;

  // Gate: the journey content (everything before Videos) must be done first.
  if (session.role !== "admin") {
    const videosIndex = JOURNEY.findIndex((m) => m.slug === "videos");
    const done = new Set(await completedSteps(targetId));
    if (videosIndex >= 0 && !isModuleUnlocked(videosIndex, done)) {
      const blocker = blockingModuleTitle(videosIndex, done);
      return NextResponse.json({ error: blocker ? `Finish “${blocker}” before submitting videos.` : "Finish the earlier modules before submitting videos." }, { status: 403 });
    }
  }

  const cleanTitle = String(title ?? "").trim().slice(0, 160) || `${chosen.label} video submission`;
  const nextPos = (await get<{ n: number }>("SELECT COALESCE(MAX(position), 0) + 1 AS n FROM deliverables WHERE user_id = ?", [targetId]))?.n ?? 1;
  const info = await run(
    `INSERT INTO deliverables (user_id, title, summary, kind, status, url, position, delivered_at)
     VALUES (?, ?, '', ?, 'review', ?, ?, now()) RETURNING id`,
    [targetId, cleanTitle, chosen.kind, cleanUrl, nextPos]
  );

  await logActivity({
    userId: targetId,
    actorName: session.name || session.email,
    actorRole: session.role,
    kind: "deliverable_submit",
    summary: `Submitted “${cleanTitle}” for review`,
  });

  return NextResponse.json({ ok: true, id: info.rows[0].id });
}

/** The creator side of review actions stays admin-only: only the Band9Prep
 *  team moves videos through review (via /api/admin/deliverables). */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Only the Band9Prep team can review videos." }, { status: 403 });

  const { id, action } = await req.json().catch(() => ({}));
  const row = await get<Deliverable>("SELECT * FROM deliverables WHERE id = ?", [Number(id)]);
  if (!row) return NextResponse.json({ error: "Deliverable not found." }, { status: 404 });
  if (session.role !== "admin" && row.user_id !== session.userId) {
    return NextResponse.json({ error: "Not yours." }, { status: 403 });
  }
  if (row.status !== "review") {
    return NextResponse.json({ error: "Only items in review can be actioned." }, { status: 400 });
  }

  if (action === "approve") {
    await run("UPDATE deliverables SET status = 'approved', approved_at = datetime('now') WHERE id = ?", [row.id]);
  } else if (action === "changes") {
    await run("UPDATE deliverables SET status = 'in_progress', delivered_at = NULL WHERE id = ?", [row.id]);
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  await logActivity({
    userId: row.user_id,
    actorName: session.name || session.email,
    actorRole: session.role,
    kind: action === "approve" ? "deliverable_approved" : "deliverable_changes",
    summary: `${action === "approve" ? "Approved" : "Requested changes on"} “${row.title}”`,
  });

  return NextResponse.json({ ok: true });
}
