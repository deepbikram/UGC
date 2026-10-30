import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { logActivity, run } from "@/lib/db";

// Admin-shared links live in the same `files` table so they show up in the
// creator's Files tab with zero migration: category + mime are "link" and
// the URL rides in stored_name (no file ever touches disk).
export async function POST(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { userId, label = "", url = "" } = await req.json().catch(() => ({}));
  const cleanLabel = String(label ?? "").trim().slice(0, 120);
  const cleanUrl = String(url ?? "").trim().slice(0, 2000);
  if (!Number(userId)) return NextResponse.json({ error: "A creator is required." }, { status: 400 });
  if (!cleanLabel) return NextResponse.json({ error: "Give the link a title." }, { status: 400 });
  if (!/^https?:\/\//i.test(cleanUrl)) {
    return NextResponse.json({ error: "Paste a full link starting with http(s)://." }, { status: 400 });
  }

  const info = await run(
    `INSERT INTO files (user_id, uploaded_by, uploader_role, label, category, file_name, stored_name, mime, size)
     VALUES (?, ?, 'admin', ?, 'link', ?, ?, 'link', 0) RETURNING id`,
    [Number(userId), session.userId, cleanLabel, cleanLabel, cleanUrl]
  );

  await logActivity({
    userId: Number(userId),
    actorName: session.name || session.email,
    actorRole: "admin",
    kind: "file_link",
    summary: `Shared link “${cleanLabel}”`,
  });

  return NextResponse.json({ ok: true, id: info.rows[0].id });
}
