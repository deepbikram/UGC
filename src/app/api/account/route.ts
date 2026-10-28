import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, createSessionToken, sessionCookie } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { isStrongEnough } from "@/lib/password";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { name, currentPassword, newPassword } = await req.json().catch(() => ({}));

  if (typeof name === "string" && name.trim()) {
    run("UPDATE users SET name = ? WHERE id = ?", [name.trim(), session.userId]);
  }

  if (newPassword) {
    if (!isStrongEnough(newPassword)) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
    const row = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [session.userId]);
    if (!row || !bcrypt.compareSync(String(currentPassword ?? ""), row.password_hash)) {
      return NextResponse.json({ error: "Your current password is not right." }, { status: 400 });
    }
    run("UPDATE users SET password_hash = ?, must_reset = 0 WHERE id = ?", [bcrypt.hashSync(String(newPassword), 10), session.userId]);
  }

  const token = await createSessionToken({ ...session, name: typeof name === "string" && name.trim() ? name.trim() : session.name, mustReset: false });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
