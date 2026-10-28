#!/usr/bin/env node
// A demo client with a half-finished journey, a live board, files, and a
// conversation — enough to see every screen with something in it.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { SCHEMA } from "../src/lib/schema.mjs";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });

const db = new Database(path.join(dataDir, "portico.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA);

const EMAIL = (process.env.DEMO_EMAIL || "dana@northwind.studio").trim().toLowerCase();
const PASSWORD = process.env.DEMO_PASSWORD || "portico-client";

let client = db.prepare("SELECT * FROM users WHERE email = ?").get(EMAIL);
if (client) {
  console.log(`→ Demo client ${EMAIL} already exists (id ${client.id}) — refreshing their data`);
  for (const t of ["progress", "form_responses", "deliverables", "files", "messages", "notes", "activity"]) {
    db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(client.id);
  }
} else {
  const info = db
    .prepare(
       `INSERT INTO users (email, name, company, password_hash, role, must_reset, seen_intro, project_name, starts_on, last_seen_at)
        VALUES (?, 'Dana Whitfield', '@dana.creates', ?, 'client', 0, 1, 'Band9Prep Creator Program', date('now','-9 days'), datetime('now','-2 hours'))`
    )
    .run(EMAIL, bcrypt.hashSync(PASSWORD, 10));
  client = { id: Number(info.lastInsertRowid) };
  console.log(`→ Created demo client ${EMAIL}`);
}

const uid = client.id;
const admin = db.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").get();
const adminId = admin?.id ?? uid;
const adminName = admin?.name ?? "Portal Admin";

// Journey: welcome and profile done, guidelines underway.
for (const step of ["welcome-how", "welcome-rules", "profile-creator", "profile-payout", "profile-acknowledge", "guidelines-faq"]) {
  db.prepare("INSERT OR IGNORE INTO progress (user_id, step_id) VALUES (?, ?)").run(uid, step);
}

const forms = {
  creator_profile: {
    full_name: "Dana Whitfield",
    phone: "+977-9800000001",
    country: "Nepal",
    city: "Kathmandu",
    display_name: "@dana.creates",
    primary_platform: "TikTok",
    tiktok_url: "https://tiktok.com/@dana.creates",
    instagram_url: "https://instagram.com/dana.creates",
    youtube_url: "",
    followers: "12k",
    languages: "Nepali, English",
    niche: "Study-abroad journeys and IELTS prep diaries for Nepali students.",
    portfolio_url: "",
    contact_method: "WhatsApp",
    contact_handle: "+977-9800000001",
    notes: "Prefers weekend shoots.",
  },
  payout_details: {
    method: "eSewa",
    esewa_name: "Dana Whitfield",
    esewa_id: "9800000001",
    khalti_name: "",
    khalti_id: "",
    bank_holder: "",
    bank_name: "",
    bank_account: "",
    bank_branch: "",
  },
};
for (const [formId, data] of Object.entries(forms)) {
  db.prepare(
    `INSERT INTO form_responses (user_id, form_id, data, status, submitted_at) VALUES (?, ?, ?, 'submitted', datetime('now','-6 days'))`
  ).run(uid, formId, JSON.stringify(data));
}

// Demo video submissions: `kind` = platform, `url` = public video URL,
// `due_on` = posted date (the 30-day window counts from here).
const deliverables = [
  ["My IELTS study routine with Band9Prep", "Morning routine + mock-test walkthrough. Reported 24,500 views on day 20.", "tiktok", "approved", "-20 days"],
  ["Band9Prep mock test — honest reaction", "Full reaction to my first mock score and what I am fixing next.", "instagram", "review", "-2 days"],
  ["How I plan writing task 2", "Planning framework I learned in week one.", "youtube", "queued", "-1 days"],
];
deliverables.forEach(([title, summary, kind, status, due], i) => {
  db.prepare(
    `INSERT INTO deliverables (user_id, title, summary, kind, status, due_on, position, created_at, delivered_at, approved_at)
     VALUES (?, ?, ?, ?, ?, date('now', ?), ?, datetime('now','-10 days'),
       CASE WHEN ? IN ('review','approved') THEN datetime('now','-2 days') ELSE NULL END,
       CASE WHEN ? = 'approved' THEN datetime('now','-2 days') ELSE NULL END)`
  ).run(uid, title, summary, kind, status, due, i + 1, status, status);
});

// A couple of files so the Files screen is not empty.
const uploadDir = path.join(dataDir, "uploads", String(uid));
fs.mkdirSync(uploadDir, { recursive: true });
const demoFiles = [
  ["tiktok-studio-day20.txt", "evidence", "client", "View evidence (creator-reported, NOT approved):\n\n- Video: My IELTS study routine with Band9Prep\n- Views on day 20: 24,500\n- Captured from TikTok Studio analytics screen.\n"],
];
for (const [name, category, who, body] of demoFiles) {
  const stored = `${Date.now()}-${Math.random().toString(16).slice(2, 12)}.txt`;
  fs.writeFileSync(path.join(uploadDir, stored), body);
  db.prepare(
    `INSERT INTO files (user_id, uploaded_by, uploader_role, label, category, file_name, stored_name, mime, size, created_at)
     VALUES (?, ?, ?, '', ?, ?, ?, 'text/plain', ?, datetime('now','-3 days'))`
  ).run(uid, who === "admin" ? adminId : uid, who, category, name, stored, Buffer.byteLength(body));
}

const messages = [
  ["admin", adminName, "Welcome in, Dana. Everything for the program lives here — start with the Welcome module, then complete your profile and payout details.", "-9 days"],
  ["client", "Dana Whitfield", "Both forms are done. Quick check: my second video is a reaction to my mock score — does that count as authentic enough?", "-6 days"],
  ["admin", adminName, "Yes — your own face, voice, and genuine reaction is exactly what the guidelines ask for. Post it and submit the URL here.", "-6 days"],
  ["client", "Dana Whitfield", "First video is up and submitted with a screenshot of the analytics.", "-2 days"],
  ["admin", adminName, "Got it — it is in the review queue. Remember views count for 30 days from the posted date, so keep the video and your profile public.", "-1 days"],
];
for (const [role, name, body, when] of messages) {
  db.prepare(
    `INSERT INTO messages (user_id, author_id, author_role, author_name, body, created_at, read_by_client, read_by_admin)
     VALUES (?, ?, ?, ?, ?, datetime('now', ?), ?, ?)`
  ).run(uid, role === "admin" ? adminId : uid, role, name, body, when, role === "client" ? 1 : 0, role === "admin" ? 1 : 0);
}

db.prepare("INSERT INTO notes (user_id, author_name, body, created_at) VALUES (?, ?, ?, datetime('now','-5 days'))").run(
  uid,
  adminName,
  "Dana's campaign rep confirmed NPR 55 per 1,000 eligible views. Rate to be stored per-creator once rate settings land — do not quote it to the creator until then."
);

const activity = [
  ["client_created", "Creator account created for Dana Whitfield (dana@northwind.studio)", "admin", adminName, "-9 days"],
  ["signin", "Signed in", "client", "Dana Whitfield", "-9 days"],
  ["form_submit", "Submitted “Creator profile”", "client", "Dana Whitfield", "-6 days"],
  ["form_submit", "Submitted “Payout details”", "client", "Dana Whitfield", "-6 days"],
  ["file_upload", "Uploaded tiktok-studio-day20.txt", "client", "Dana Whitfield", "-3 days"],
  ["deliverable_status", "Marked “My IELTS study routine with Band9Prep” eligible", "admin", adminName, "-4 days"],
  ["deliverable_status", "Submitted “Band9Prep mock test — honest reaction” for review", "admin", adminName, "-1 days"],
];
for (const [kind, summary, role, name, when] of activity) {
  db.prepare("INSERT INTO activity (user_id, actor_name, actor_role, kind, summary, created_at) VALUES (?, ?, ?, ?, ?, datetime('now', ?))").run(
    uid, name, role, kind, summary, when
  );
}

console.log(`
  Demo data seeded.

    Creator sign-in   http://localhost:5800/login
    Email            ${EMAIL}
    Password         ${PASSWORD}
`);
