#!/usr/bin/env node
// A demo client with a half-finished journey, a live board, files, and a
// conversation — enough to see every screen with something in it.
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { many, one, q, close } from "./pg.mjs";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(path.join(dataDir, "uploads"), { recursive: true });

const EMAIL = (process.env.DEMO_EMAIL || "dana@northwind.studio").trim().toLowerCase();
const PASSWORD = process.env.DEMO_PASSWORD || "portico-client";

const ago = (ms) => new Date(Date.now() - ms).toISOString();
const DAY = 86_400_000;

let client = await one("SELECT * FROM users WHERE email = ?", [EMAIL]);
if (client) {
  console.log(`→ Demo client ${EMAIL} already exists (id ${client.id}) — refreshing their data`);
  for (const t of ["progress", "form_responses", "deliverables", "files", "messages", "notes", "activity"]) {
    await q(`DELETE FROM ${t} WHERE user_id = ?`, [client.id]);
  }
} else {
  client = await one(
    `INSERT INTO users (email, name, company, password_hash, role, must_reset, seen_intro, project_name, starts_on, last_seen_at)
     VALUES (?, 'Dana Whitfield', '@dana.creates', ?, 'client', false, true, 'Band9Prep Creator Program', ?, ?)
     RETURNING id`,
    [EMAIL, bcrypt.hashSync(PASSWORD, 10), ago(9 * DAY).slice(0, 10), ago(2 * 3600_000)]
  );
  console.log(`→ Created demo client ${EMAIL}`);
}

const uid = client.id;
const admin = await one("SELECT * FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
const adminId = admin?.id ?? uid;
const adminName = admin?.name ?? "Portal Admin";

for (const step of ["welcome-how", "welcome-rules", "profile-creator", "profile-payout", "profile-acknowledge", "guidelines-faq"]) {
  await q("INSERT INTO progress (user_id, step_id) VALUES (?, ?) ON CONFLICT DO NOTHING", [uid, step]);
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
  await q(
    `INSERT INTO form_responses (user_id, form_id, data, status, submitted_at) VALUES (?, ?, ?::jsonb, 'submitted', ?)`,
    [uid, formId, JSON.stringify(data), ago(6 * DAY)]
  );
}

const deliverables = [
  ["My IELTS study routine with Band9Prep", "Morning routine + mock-test walkthrough. Reported 24,500 views on day 20.", "tiktok", "approved", 20],
  ["Band9Prep mock test — honest reaction", "Full reaction to my first mock score and what I am fixing next.", "instagram", "review", 2],
  ["How I plan writing task 2", "Planning framework I learned in week one.", "youtube", "queued", 1],
];
for (const [i, [title, summary, kind, status, days]] of deliverables.entries()) {
  await q(
    `INSERT INTO deliverables (user_id, title, summary, kind, status, due_on, position, created_at, delivered_at, approved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid, title, summary, kind, status, ago(days * DAY).slice(0, 10), i + 1, ago(10 * DAY),
      status === "review" || status === "approved" ? ago(2 * DAY) : null,
      status === "approved" ? ago(2 * DAY) : null,
    ]
  );
}

const uploadDir = path.join(dataDir, "uploads", String(uid));
fs.mkdirSync(uploadDir, { recursive: true });
const body =
  "View evidence (creator-reported, NOT approved):\n\n- Video: My IELTS study routine with Band9Prep\n- Views on day 20: 24,500\n- Captured from TikTok Studio analytics screen.\n";
const stored = `${Date.now()}-${Math.random().toString(16).slice(2, 12)}.txt`;
fs.writeFileSync(path.join(uploadDir, stored), body);
await q(
  `INSERT INTO files (user_id, uploaded_by, uploader_role, label, category, file_name, stored_name, mime, size, created_at)
   VALUES (?, ?, 'client', '', 'evidence', ?, ?, 'text/plain', ?, ?)`,
  [uid, uid, "tiktok-studio-day20.txt", stored, Buffer.byteLength(body), ago(3 * DAY)]
);

const messages = [
  ["admin", adminName, "Welcome in, Dana. Everything for the program lives here — start with the Welcome module, then complete your profile and payout details.", 9],
  ["client", "Dana Whitfield", "Both forms are done. Quick check: my second video is a reaction to my mock score — does that count as authentic enough?", 6],
  ["admin", adminName, "Yes — your own face, voice, and genuine reaction is exactly what the guidelines ask for. Post it and submit the URL here.", 6],
  ["client", "Dana Whitfield", "First video is up and submitted with a screenshot of the analytics.", 2],
  ["admin", adminName, "Got it — it is in the review queue. Remember views count for 30 days from the posted date, so keep the video and your profile public.", 1],
];
for (const [role, name, text, days] of messages) {
  await q(
    `INSERT INTO messages (user_id, author_id, author_role, author_name, body, created_at, read_by_client, read_by_admin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uid, role === "admin" ? adminId : uid, role, name, text, ago(days * DAY), role === "client", role === "admin"]
  );
}

await q("INSERT INTO notes (user_id, author_name, body, created_at) VALUES (?, ?, ?, ?)", [
  uid,
  adminName,
  "Dana's campaign rep confirmed NPR 55 per 1,000 eligible views. Rate to be stored per-creator once rate settings land — do not quote it to the creator until then.",
  ago(5 * DAY),
]);

const activity = [
  ["client_created", "Creator account created for Dana Whitfield (dana@northwind.studio)", "admin", adminName, 9],
  ["signin", "Signed in", "client", "Dana Whitfield", 9],
  ["form_submit", "Submitted “Creator profile”", "client", "Dana Whitfield", 6],
  ["form_submit", "Submitted “Payout details”", "client", "Dana Whitfield", 6],
  ["file_upload", "Uploaded tiktok-studio-day20.txt", "client", "Dana Whitfield", 3],
  ["deliverable_status", "Marked “My IELTS study routine with Band9Prep” eligible", "admin", adminName, 4],
  ["deliverable_status", "Submitted “Band9Prep mock test — honest reaction” for review", "admin", adminName, 1],
];
for (const [kind, summary, role, name, days] of activity) {
  await q("INSERT INTO activity (user_id, actor_name, actor_role, kind, summary, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
    uid, name, role, kind, summary, ago(days * DAY),
  ]);
}

await close();

console.log(`
  Demo data seeded.

    Creator sign-in   http://localhost:5800/login
    Email            ${EMAIL}
    Password         ${PASSWORD}
`);
