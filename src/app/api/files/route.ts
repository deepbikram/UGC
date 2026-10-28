import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { all, get, logActivity, run, type FileRow } from "@/lib/db";
import { completeStep } from "@/lib/clients";
import { ALL_STEPS } from "@/lib/journey";
import { deleteUpload, isAllowedType, MAX_UPLOAD_BYTES, safeName, saveUpload } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const category = String(form.get("category") ?? "general").slice(0, 40);
  const label = String(form.get("label") ?? "").slice(0, 160);
  const forUser = form.get("userId");

  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Files are limited to 25 MB." }, { status: 400 });
  if (!isAllowedType(file.type)) return NextResponse.json({ error: `Files of type ${file.type || "unknown"} are not accepted.` }, { status: 400 });

  const ownerId = session.role === "admin" && forUser ? Number(forUser) : session.userId;
  const { storedName, size } = await saveUpload(ownerId, file);

  run(
    `INSERT INTO files (user_id, uploaded_by, uploader_role, label, category, file_name, stored_name, mime, size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ownerId, session.userId, session.role, label, category, safeName(file.name), storedName, file.type || "application/octet-stream", size]
  );

  // An upload step counts as done the moment the first file lands in its bucket.
  const step = ALL_STEPS.find((s) => s.upload?.category === category);
  if (step) completeStep(ownerId, step.id);

  logActivity({
    userId: ownerId,
    actorName: session.name || session.email,
    actorRole: session.role,
    kind: "file_upload",
    summary: `Uploaded ${safeName(file.name)}`,
  });

  return NextResponse.json({ ok: true, files: all<FileRow>("SELECT * FROM files WHERE user_id = ? AND category = ? ORDER BY created_at DESC", [ownerId, category]) });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  const row = get<FileRow>("SELECT * FROM files WHERE id = ?", [Number(id)]);
  if (!row) return NextResponse.json({ error: "File not found." }, { status: 404 });
  if (session.role !== "admin" && row.user_id !== session.userId) {
    return NextResponse.json({ error: "Not your file." }, { status: 403 });
  }

  deleteUpload(row.user_id, row.stored_name);
  run("DELETE FROM files WHERE id = ?", [row.id]);
  logActivity({ userId: row.user_id, actorName: session.name || session.email, actorRole: session.role, kind: "file_delete", summary: `Deleted ${row.file_name}` });

  return NextResponse.json({ ok: true });
}
