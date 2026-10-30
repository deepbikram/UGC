import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { get, logActivity, run, type Deliverable } from "@/lib/db";

const STATUSES = new Set(["queued", "in_progress", "review", "approved", "rejected"]);

export async function POST(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { userId, title, summary = "", kind = "other", url = "", dueOn = "" } = await req.json().catch(() => ({}));
  if (!userId || !String(title ?? "").trim()) return NextResponse.json({ error: "A client and a title are required." }, { status: 400 });

  const nextPos = (await get<{ n: number }>("SELECT COALESCE(MAX(position), 0) + 1 AS n FROM deliverables WHERE user_id = ?", [Number(userId)]))?.n ?? 1;
  const info = await run(
    "INSERT INTO deliverables (user_id, title, summary, kind, url, due_on, position) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
    [Number(userId), String(title).trim().slice(0, 160), String(summary).slice(0, 2000), String(kind), String(url).slice(0, 500), String(dueOn).slice(0, 20) || null, nextPos]
  );

  await logActivity({ userId: Number(userId), actorName: session.name, actorRole: "admin", kind: "deliverable_added", summary: `Added “${String(title).trim()}”` });
  return NextResponse.json({ ok: true, id: info.rows[0].id });
}

export async function PATCH(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id, status, title, summary, url, dueOn, kind, reviewNote } = await req.json().catch(() => ({}));
  const row = await get<Deliverable>("SELECT * FROM deliverables WHERE id = ?", [Number(id)]);
  if (!row) return NextResponse.json({ error: "Deliverable not found." }, { status: 404 });

  if (status !== undefined) {
    if (!STATUSES.has(String(status))) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    if (String(status) === "rejected" && !String(reviewNote ?? row.review_note ?? "").trim()) {
      return NextResponse.json({ error: "Write the rejection reason first." }, { status: 400 });
    }
    await run(
      `UPDATE deliverables SET status = ?,
         delivered_at = CASE WHEN ? IN ('review','approved') THEN COALESCE(delivered_at, datetime('now')) ELSE NULL END,
         approved_at  = CASE WHEN ? = 'approved' THEN COALESCE(approved_at, datetime('now')) ELSE NULL END
       WHERE id = ?`,
      [String(status), String(status), String(status), row.id]
    );
    await logActivity({ userId: row.user_id, actorName: session.name, actorRole: "admin", kind: "deliverable_status", summary: `Moved “${row.title}” to ${String(status).replace("_", " ")}` });
  }

  const fields: [string, unknown][] = [];
  if (title !== undefined) fields.push(["title", String(title).slice(0, 160)]);
  if (summary !== undefined) fields.push(["summary", String(summary).slice(0, 2000)]);
  if (url !== undefined) fields.push(["url", String(url).slice(0, 500)]);
  if (dueOn !== undefined) fields.push(["due_on", String(dueOn).slice(0, 20) || null]);
  if (kind !== undefined) fields.push(["kind", String(kind).slice(0, 40)]);
  if (reviewNote !== undefined) fields.push(["review_note", String(reviewNote).slice(0, 2000)]);
  if (fields.length) {
    await run(`UPDATE deliverables SET ${fields.map(([f]) => `${f} = ?`).join(", ")} WHERE id = ?`, [...fields.map(([, v]) => v), row.id]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  const row = await get<Deliverable>("SELECT * FROM deliverables WHERE id = ?", [Number(id)]);
  if (!row) return NextResponse.json({ error: "Deliverable not found." }, { status: 404 });

  await run("DELETE FROM deliverables WHERE id = ?", [row.id]);
  await logActivity({ userId: row.user_id, actorName: session.name, actorRole: "admin", kind: "deliverable_removed", summary: `Removed “${row.title}”` });
  return NextResponse.json({ ok: true });
}
