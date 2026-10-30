// Portico talks to Supabase Postgres directly over the pooler using the
// `portico_app` role. Queries are still plain SQL; `?` placeholders are
// rewritten to `$1..$n` so call sites stay driver-agnostic.
import { Pool, types } from "pg";

types.setTypeParser(20, (v) => (v === null ? null : Number(v)));
types.setTypeParser(1184, (v) => (v === null ? null : new Date(v).toISOString()));
types.setTypeParser(1114, (v) => (v === null ? null : new Date(`${v}Z`).toISOString()));
types.setTypeParser(1082, (v) => v);

const globalForDb = globalThis as unknown as { porticoPool?: Pool; porticoWarmed?: boolean };

function pool(): Pool {
  if (!globalForDb.porticoPool) {
    globalForDb.porticoPool = new Pool({
      connectionString: process.env.SUPABASE_DB_URL!,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30_000,
    });
  }
  return globalForDb.porticoPool;
}

// ponytail: pre-open connections at boot so the first request after idle
// isn't paying 3x TLS handshakes to Supabase in series
if (!globalForDb.porticoWarmed) {
  globalForDb.porticoWarmed = true;
  const p = pool();
  Promise.all([p.query("SELECT 1"), p.query("SELECT 1"), p.query("SELECT 1")]).catch(() => {});
}

function toPg(sql: string) {
  let i = 0;
  return sql
    .replace(/\?/g, () => `$${++i}`)
    .replace(/datetime\('now'\)/g, "now()");
}

export type RunResult = { rowCount: number; rows: Record<string, unknown>[] };

export type Role = "admin" | "client";

export type User = {
  id: number;
  email: string;
  name: string;
  company: string;
  password_hash: string;
  role: Role;
  must_reset: boolean;
  seen_intro: boolean;
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
  review_note: string;
};

export type DeliverableStatus = "queued" | "in_progress" | "review" | "approved" | "rejected";

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
  read_by_client: boolean;
  read_by_admin: boolean;
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
export async function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const res = await pool().query(toPg(sql), params);
  return res.rows[0] as T | undefined;
}

export async function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(toPg(sql), params);
  return res.rows as T[];
}

export async function run(sql: string, params: unknown[] = []): Promise<RunResult> {
  const res = await pool().query(toPg(sql), params);
  return { rowCount: res.rowCount ?? 0, rows: res.rows as Record<string, unknown>[] };
}

export async function getSetting(key: string): Promise<string> {
  const row = await get<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
  return row?.value ?? "";
}

export async function setSetting(key: string, value: string) {
  await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [key, value]);
}

export async function logActivity(entry: {
  userId?: number | null;
  actorName: string;
  actorRole: Role;
  kind: string;
  summary: string;
}) {
  await run("INSERT INTO activity (user_id, actor_name, actor_role, kind, summary) VALUES (?, ?, ?, ?, ?)", [
    entry.userId ?? null,
    entry.actorName,
    entry.actorRole,
    entry.kind,
    entry.summary,
  ]);
}
