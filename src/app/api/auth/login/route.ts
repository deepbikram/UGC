import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { run, logActivity } from "@/lib/db";
import { getUserByEmail } from "@/lib/clients";
import { createSessionToken, sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const user = await getUserByEmail(String(email));
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return NextResponse.json({ error: "That email and password do not match." }, { status: 401 });
  }
  if (user.status === "archived") {
    return NextResponse.json({ error: "This account is no longer active." }, { status: 403 });
  }

  await run("UPDATE users SET last_seen_at = datetime('now') WHERE id = ?", [user.id]);
  await logActivity({ userId: user.role === "client" ? user.id : null, actorName: user.name || user.email, actorRole: user.role, kind: "signin", summary: "Signed in" });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustReset: !!user.must_reset,
  });
  const res = NextResponse.json({ ok: true, mustReset: !!user.must_reset, role: user.role });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
