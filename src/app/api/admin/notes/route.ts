import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { run } from "@/lib/db";

export async function POST(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { userId, body } = await req.json().catch(() => ({}));
  const text = String(body ?? "").trim();
  if (!userId || !text) return NextResponse.json({ error: "A client and a note are required." }, { status: 400 });

  await run("INSERT INTO notes (user_id, author_name, body) VALUES (?, ?, ?)", [Number(userId), session.name || session.email, text.slice(0, 4000)]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  await run("DELETE FROM notes WHERE id = ?", [Number(id)]);
  return NextResponse.json({ ok: true });
}
