// Uploads are written to data/uploads/<userId>/ and served back through an
// authenticated route, never from /public — a client can only ever read files
// attached to their own project.
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR } from "./db";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED = new Set([
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml", "image/avif",
  "application/pdf", "application/zip", "application/x-zip-compressed",
  "text/plain", "text/csv", "text/markdown",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "font/otf", "font/ttf", "font/woff", "font/woff2", "application/octet-stream",
]);

export function isAllowedType(mime: string): boolean {
  return ALLOWED.has(mime) || mime.startsWith("image/") || mime.startsWith("text/");
}

/** Strip anything that could escape the uploads directory. */
export function safeName(name: string): string {
  return path.basename(name).replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
}

export async function saveUpload(userId: number, file: File): Promise<{ storedName: string; size: number }> {
  const dir = path.join(UPLOAD_DIR, String(userId));
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(safeName(file.name)).slice(0, 12);
  const storedName = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, storedName), bytes);
  return { storedName, size: bytes.length };
}

export function uploadPath(userId: number, storedName: string): string {
  return path.join(UPLOAD_DIR, String(userId), path.basename(storedName));
}

export function deleteUpload(userId: number, storedName: string) {
  const p = uploadPath(userId, storedName);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

/** Everything a client ever uploaded. Used when their account is deleted, so
 *  the database cascade does not leave orphaned files on disk. */
export function deleteUserUploads(userId: number) {
  const dir = path.join(UPLOAD_DIR, String(userId));
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
