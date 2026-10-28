import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { all, logActivity, run, type Message } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const url = new URL(req.url);
  const userId = session.role === "admin" ? Number(url.searchParams.get("userId") ?? 0) : session.userId;
  if (!userId) return NextResponse.json({ error: "Which client?" }, { status: 400 });

  return NextResponse.json({ messages: all<Message>("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at", [userId]) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { body, userId } = await req.json().catch(() => ({}));
  const text = String(body ?? "").trim();
  if (!text) return NextResponse.json({ error: "Write something first." }, { status: 400 });
  if (text.length > 8000) return NextResponse.json({ error: "That message is too long." }, { status: 400 });

  const threadId = session.role === "admin" ? Number(userId) : session.userId;
  if (!threadId) return NextResponse.json({ error: "Which client?" }, { status: 400 });

  run(
    `INSERT INTO messages (user_id, author_id, author_role, author_name, body, read_by_client, read_by_admin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [threadId, session.userId, session.role, session.name || session.email, text, session.role === "client" ? 1 : 0, session.role === "admin" ? 1 : 0]
  );

  logActivity({ userId: threadId, actorName: session.name || session.email, actorRole: session.role, kind: "message", summary: text.slice(0, 120) });

  return NextResponse.json({ ok: true, messages: all<Message>("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at", [threadId]) });
}

/** Mark the other side's messages in a thread as read. */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { userId } = await req.json().catch(() => ({}));
  const threadId = session.role === "admin" ? Number(userId) : session.userId;
  if (!threadId) return NextResponse.json({ error: "Which client?" }, { status: 400 });

  if (session.role === "admin") run("UPDATE messages SET read_by_admin = 1 WHERE user_id = ? AND author_role = 'client'", [threadId]);
  else run("UPDATE messages SET read_by_client = 1 WHERE user_id = ? AND author_role = 'admin'", [threadId]);

  return NextResponse.json({ ok: true });
}
