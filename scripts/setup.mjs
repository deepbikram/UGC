#!/usr/bin/env node
// One-time setup: generate a signing secret if missing and create the admin
// account. Safe to run again — nothing is overwritten. The schema itself is
// applied to Supabase with `supabase db push` (see supabase/migrations).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { one, q, close } from "./pg.mjs";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@portico.dev").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "portico-admin";
const ADMIN_NAME = process.env.ADMIN_NAME || "Portal Admin";

fs.mkdirSync(path.join(root, "data", "uploads"), { recursive: true });

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
if (!/^AUTH_SECRET=/m.test(env)) {
  const secret = crypto.randomBytes(32).toString("base64url");
  env += `${env && !env.endsWith("\n") ? "\n" : ""}AUTH_SECRET=${secret}\n`;
  fs.writeFileSync(envPath, env);
  console.log("→ Generated AUTH_SECRET in .env.local");
} else {
  console.log("→ AUTH_SECRET already set, leaving it alone");
}

const existing = await one("SELECT id FROM users WHERE email = ?", [ADMIN_EMAIL]);
if (existing) {
  console.log(`→ Admin ${ADMIN_EMAIL} already exists, leaving it alone`);
} else {
  await q(
    "INSERT INTO users (email, name, password_hash, role, must_reset, seen_intro) VALUES (?, ?, ?, 'admin', false, true)",
    [ADMIN_EMAIL, ADMIN_NAME, bcrypt.hashSync(ADMIN_PASSWORD, 10)]
  );
  console.log("→ Created the admin account");
}

await close();

console.log(`
  Portico is set up.

    Sign in   http://localhost:5800/login
    Email     ${ADMIN_EMAIL}
    Password  ${ADMIN_PASSWORD}

  Change the password from Account once you are in — and always change it
  before this is reachable from the internet.

  Next:  npm run seed   (a demo client to look around with)
         npm run dev
`);
