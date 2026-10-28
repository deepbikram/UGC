import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken, sessionCookie } from "@/lib/auth";
import { get, logActivity, run } from "@/lib/db";
import { getUserByEmail } from "@/lib/clients";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public creator signup. Always creates a `client`-role account with an
// incomplete onboarding state — never an admin, never a chosen role.
export async function POST(req: Request) {
  const { name, email, password, country = "", contactMethod = "", contactHandle = "" } = await req.json().catch(() => ({}));

  const cleanName = String(name ?? "").trim().slice(0, 120);
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanCountry = String(country ?? "").trim().slice(0, 80);
  const cleanContactMethod = String(contactMethod ?? "").trim().slice(0, 40);
  const cleanContactHandle = String(contactHandle ?? "").trim().slice(0, 160);

  if (!cleanName) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!EMAIL_RE.test(cleanEmail)) return NextResponse.json({ error: "That email does not look right." }, { status: 400 });
  if (String(password ?? "").length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (getUserByEmail(cleanEmail)) return NextResponse.json({ error: "An account with that email already exists. Try signing in." }, { status: 409 });

  // Stash contact preference in the profile form's future answers blob seed:
  // keep the users row schema untouched (no migration) and let the
  // creator_profile form hold the rest of onboarding.
  const info = run(
    `INSERT INTO users (email, name, company, password_hash, role, must_reset, seen_intro, project_name)
     VALUES (?, ?, '', ?, 'client', 0, 0, 'Band9Prep Creator Program')`,
    [cleanEmail, cleanName, bcrypt.hashSync(String(password), 10)]
  );
  const id = Number(info.lastInsertRowid);

  if (cleanCountry || cleanContactMethod || cleanContactHandle) {
    run(
      `INSERT INTO form_responses (user_id, form_id, data, status) VALUES (?, 'creator_profile', ?, 'draft')
       ON CONFLICT(user_id, form_id) DO NOTHING`,
      [id, JSON.stringify({ country: cleanCountry, contact_method: cleanContactMethod, contact_handle: cleanContactHandle })]
    );
  }

  const user = get<{ id: number; email: string; name: string; role: "admin" | "client" }>(
    "SELECT id, email, name, role FROM users WHERE id = ?",
    [id]
  );
  logActivity({ userId: id, actorName: cleanName, actorRole: "client", kind: "signup", summary: "Created a creator account" });

  const token = await createSessionToken({
    userId: user!.id,
    email: user!.email,
    name: user!.name,
    role: "client",
    mustReset: false,
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return res;
}
