// Read helpers shared by the client pages and the admin. Everything here runs
// on the server only.
import { all, get, run, type Deliverable, type FileRow, type Message, type Note, type User } from "./db";
import { ALL_STEP_IDS, journeyStats, phaseFor } from "./journey";

export function getUser(id: number): User | undefined {
  return get<User>("SELECT * FROM users WHERE id = ?", [id]);
}

export function getUserByEmail(email: string): User | undefined {
  return get<User>("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
}

export function completedSteps(userId: number): string[] {
  return all<{ step_id: string }>("SELECT step_id FROM progress WHERE user_id = ?", [userId])
    .map((r) => r.step_id)
    .filter((id) => ALL_STEP_IDS.has(id));
}

export function completeStep(userId: number, stepId: string) {
  run("INSERT OR IGNORE INTO progress (user_id, step_id) VALUES (?, ?)", [userId, stepId]);
}

export function uncompleteStep(userId: number, stepId: string) {
  run("DELETE FROM progress WHERE user_id = ? AND step_id = ?", [userId, stepId]);
}

export function formResponse(userId: number, formId: string) {
  const row = get<{ data: string; status: string; submitted_at: string | null; updated_at: string }>(
    "SELECT data, status, submitted_at, updated_at FROM form_responses WHERE user_id = ? AND form_id = ?",
    [userId, formId]
  );
  if (!row) return { data: {} as Record<string, unknown>, status: "draft", submittedAt: null as string | null, updatedAt: "" };
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(row.data) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return { data, status: row.status, submittedAt: row.submitted_at, updatedAt: row.updated_at };
}

export function saveFormResponse(userId: number, formId: string, data: Record<string, unknown>, submit: boolean) {
  run(
    `INSERT INTO form_responses (user_id, form_id, data, status, updated_at, submitted_at)
     VALUES (?, ?, ?, ?, datetime('now'), ?)
     ON CONFLICT(user_id, form_id) DO UPDATE SET
       data = excluded.data,
       status = excluded.status,
       updated_at = datetime('now'),
       submitted_at = COALESCE(form_responses.submitted_at, excluded.submitted_at)`,
    [userId, formId, JSON.stringify(data), submit ? "submitted" : "draft", submit ? new Date().toISOString() : null]
  );
}

export function deliverables(userId: number): Deliverable[] {
  return all<Deliverable>("SELECT * FROM deliverables WHERE user_id = ? ORDER BY position, id", [userId]);
}

export function files(userId: number, category?: string): FileRow[] {
  return category
    ? all<FileRow>("SELECT * FROM files WHERE user_id = ? AND category = ? ORDER BY created_at DESC", [userId, category])
    : all<FileRow>("SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC", [userId]);
}

export function messages(userId: number): Message[] {
  return all<Message>("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at", [userId]);
}

export function unreadFor(userId: number, role: "admin" | "client"): number {
  const col = role === "admin" ? "read_by_admin" : "read_by_client";
  const other = role === "admin" ? "client" : "admin";
  const row = get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM messages WHERE user_id = ? AND author_role = ? AND ${col} = 0`,
    [userId, other]
  );
  return row?.n ?? 0;
}

export function notes(userId: number): Note[] {
  return all<Note>("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC", [userId]);
}

export type ClientSummary = {
  id: number;
  name: string;
  email: string;
  company: string;
  projectName: string;
  status: string;
  phase: string;
  pct: number;
  done: number;
  total: number;
  deliverables: { total: number; review: number; approved: number };
  unread: number;
  fileCount: number;
  mustReset: boolean;
  createdAt: string;
  lastSeenAt: string | null;
};

export function clientSummaries(includeArchived = false): ClientSummary[] {
  const rows = all<User>(
    `SELECT * FROM users WHERE role = 'client' ${includeArchived ? "" : "AND status = 'active'"} ORDER BY created_at DESC`
  );
  return rows.map((u) => {
    const completed = new Set(completedSteps(u.id));
    const stats = journeyStats(completed);
    const d = all<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM deliverables WHERE user_id = ? GROUP BY status", [u.id]);
    const byStatus = Object.fromEntries(d.map((r) => [r.status, r.n]));
    const fileCount = get<{ n: number }>("SELECT COUNT(*) AS n FROM files WHERE user_id = ?", [u.id])?.n ?? 0;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company,
      projectName: u.project_name,
      status: u.status,
      phase: phaseFor(completed),
      pct: stats.pct,
      done: stats.done,
      total: stats.total,
      deliverables: {
        total: d.reduce((a, r) => a + r.n, 0),
        review: byStatus["review"] ?? 0,
        approved: byStatus["approved"] ?? 0,
      },
      unread: unreadFor(u.id, "admin"),
      fileCount,
      mustReset: u.must_reset === 1,
      createdAt: u.created_at,
      lastSeenAt: u.last_seen_at,
    };
  });
}

/** Things the operator should look at, newest signal first. */
export function attention(summaries: ClientSummary[]): { clientId: number; client: string; message: string; severity: "action" | "warn" | "info" }[] {
  const items: { clientId: number; client: string; message: string; severity: "action" | "warn" | "info" }[] = [];
  for (const c of summaries) {
    if (c.unread > 0) items.push({ clientId: c.id, client: c.name, message: `${c.unread} unread message${c.unread > 1 ? "s" : ""}`, severity: "action" });
    if (c.deliverables.review > 0) items.push({ clientId: c.id, client: c.name, message: `${c.deliverables.review} deliverable${c.deliverables.review > 1 ? "s" : ""} waiting on their review`, severity: "warn" });
    if (c.mustReset) items.push({ clientId: c.id, client: c.name, message: "Invite not accepted yet — still on the one-time password", severity: "info" });
    if (!c.mustReset && c.done === 0) items.push({ clientId: c.id, client: c.name, message: "Signed in but has not started onboarding", severity: "info" });
  }
  const rank = { action: 0, warn: 1, info: 2 };
  return items.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
