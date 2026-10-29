import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { run, logActivity } from "@/lib/db";
import { getSession, createSessionToken, sessionCookie } from "@/lib/auth";
import { isStrongEnough } from "@/lib/password";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { password } = await req.json().catch(() => ({}));
  if (!isStrongEnough(password)) {
    return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  }

  await run("UPDATE users SET password_hash = ?, must_reset = false WHERE id = ?", [bcrypt.hashSync(String(password), 10), session.userId]);
  await logActivity({
    userId: session.role === "client" ? session.userId : null,
    actorName: session.name || session.email,
    actorRole: session.role,
    kind: "password",
    summary: "Set their password",
  });

  const token = await createSessionToken({ ...session, mustReset: false });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
