import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { get, logActivity, run, type User } from "@/lib/db";
import { getUserByEmail } from "@/lib/clients";
import { generatePassword } from "@/lib/password";
import { deleteUserUploads } from "@/lib/storage";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { name, email, company = "", projectName = "", startsOn = "" } = await req.json().catch(() => ({}));
  const cleanEmail = String(email ?? "").trim().toLowerCase();

  if (!String(name ?? "").trim()) return NextResponse.json({ error: "A name is required." }, { status: 400 });
  if (!EMAIL_RE.test(cleanEmail)) return NextResponse.json({ error: "That email does not look right." }, { status: 400 });
  if (getUserByEmail(cleanEmail)) return NextResponse.json({ error: "Someone already has that email." }, { status: 409 });

  // The client signs in once with this, then has to choose their own.
  const password = generatePassword();
  const info = run(
    `INSERT INTO users (email, name, company, password_hash, role, must_reset, project_name, starts_on)
     VALUES (?, ?, ?, ?, 'client', 1, ?, ?)`,
    [
      cleanEmail,
      String(name).trim().slice(0, 120),
      String(company).trim().slice(0, 160),
      bcrypt.hashSync(password, 10),
      String(projectName).trim().slice(0, 160),
      String(startsOn).slice(0, 20),
    ]
  );

  const id = Number(info.lastInsertRowid);
  logActivity({ userId: id, actorName: session.name || session.email, actorRole: "admin", kind: "client_created", summary: `Invited ${String(name).trim()} (${cleanEmail})` });

  return NextResponse.json({ ok: true, id, email: cleanEmail, password });
}

export async function PATCH(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id, action, ...rest } = (await req.json().catch(() => ({}))) as Record<string, unknown> & { id?: number; action?: string };
  const user = get<User>("SELECT * FROM users WHERE id = ? AND role = 'client'", [Number(id)]);
  if (!user) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  if (action === "reset-password") {
    const password = generatePassword();
    run("UPDATE users SET password_hash = ?, must_reset = 1 WHERE id = ?", [bcrypt.hashSync(password, 10), user.id]);
    logActivity({ userId: user.id, actorName: session.name || session.email, actorRole: "admin", kind: "client_reset", summary: `Issued a new one-time password` });
    return NextResponse.json({ ok: true, password });
  }

  if (action === "archive" || action === "restore") {
    run("UPDATE users SET status = ? WHERE id = ?", [action === "archive" ? "archived" : "active", user.id]);
    logActivity({ userId: user.id, actorName: session.name || session.email, actorRole: "admin", kind: "client_status", summary: action === "archive" ? "Archived the client" : "Restored the client" });
    return NextResponse.json({ ok: true });
  }

  const map: Record<string, string> = { name: "name", company: "company", projectName: "project_name", startsOn: "starts_on", email: "email" };
  const fields: [string, string][] = [];
  for (const [key, col] of Object.entries(map)) {
    const v = rest[key];
    if (v === undefined) continue;
    if (key === "email") {
      const cleanEmail = String(v).trim().toLowerCase();
      if (!EMAIL_RE.test(cleanEmail)) return NextResponse.json({ error: "That email does not look right." }, { status: 400 });
      const clash = getUserByEmail(cleanEmail);
      if (clash && clash.id !== user.id) return NextResponse.json({ error: "Someone already has that email." }, { status: 409 });
      fields.push([col, cleanEmail]);
    } else {
      fields.push([col, String(v).slice(0, 200)]);
    }
  }
  if (fields.length) {
    run(`UPDATE users SET ${fields.map(([f]) => `${f} = ?`).join(", ")} WHERE id = ?`, [...fields.map(([, v]) => v), user.id]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  const user = get<User>("SELECT * FROM users WHERE id = ? AND role = 'client'", [Number(id)]);
  if (!user) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  // Progress, forms, deliverables, files, messages, and notes cascade with the
  // row; the files on disk do not, so they go first.
  deleteUserUploads(user.id);
  run("DELETE FROM users WHERE id = ?", [user.id]);
  logActivity({ actorName: session.name || session.email, actorRole: "admin", kind: "client_deleted", summary: `Deleted ${user.name || user.email} and everything attached to them` });

  return NextResponse.json({ ok: true });
}
