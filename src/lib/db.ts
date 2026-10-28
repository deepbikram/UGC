// Portico stores everything in one SQLite file (data/portico.db) and one
// uploads directory (data/uploads). No external service, no API key, no
// migration tool: the schema in schema.mjs is created on first import and is
// the single source of truth.
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { SCHEMA } from "./schema.mjs";

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "portico.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(SCHEMA);

export type Role = "admin" | "client";

export type User = {
  id: number;
  email: string;
  name: string;
  company: string;
  password_hash: string;
  role: Role;
  must_reset: number;
  seen_intro: number;
  status: "active" | "archived";
  project_name: string;
  starts_on: string;
  created_at: string;
  last_seen_at: string | null;
};

export type Deliverable = {
  id: number;
  user_id: number;
  title: string;
  summary: string;
  kind: string;
  status: DeliverableStatus;
  url: string;
  due_on: string;
  position: number;
  created_at: string;
  delivered_at: string | null;
  approved_at: string | null;
};

export type DeliverableStatus = "queued" | "in_progress" | "review" | "approved";

export type FileRow = {
  id: number;
  user_id: number;
  uploaded_by: number;
  uploader_role: Role;
  label: string;
  category: string;
  file_name: string;
  stored_name: string;
  mime: string;
  size: number;
  created_at: string;
};

export type Message = {
  id: number;
  user_id: number;
  author_id: number;
  author_role: Role;
  author_name: string;
  body: string;
  created_at: string;
  read_by_client: number;
  read_by_admin: number;
};

export type Note = { id: number; user_id: number; author_name: string; body: string; created_at: string };

export type ActivityRow = {
  id: number;
  user_id: number | null;
  actor_name: string;
  actor_role: Role;
  kind: string;
  summary: string;
  created_at: string;
};

/** Small typed wrappers so callers never touch the driver directly. */
export function get<T>(sql: string, params: unknown[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function all<T>(sql: string, params: unknown[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function run(sql: string, params: unknown[] = []) {
  return db.prepare(sql).run(...params);
}

export function getSetting(key: string): string {
  const row = get<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
  return row?.value ?? "";
}

export function setSetting(key: string, value: string) {
  run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [key, value]);
}

export function logActivity(entry: {
  userId?: number | null;
  actorName: string;
  actorRole: Role;
  kind: string;
  summary: string;
}) {
  run("INSERT INTO activity (user_id, actor_name, actor_role, kind, summary) VALUES (?, ?, ?, ?, ?)", [
    entry.userId ?? null,
    entry.actorName,
    entry.actorRole,
    entry.kind,
    entry.summary,
  ]);
}

export default db;
