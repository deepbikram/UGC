import { NextResponse } from "next/server";
import fs from "fs";
import { getSession } from "@/lib/auth";
import { get, type FileRow } from "@/lib/db";
import { uploadPath } from "@/lib/storage";

/** Uploads never sit in /public: every download is checked against the session. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const row = get<FileRow>("SELECT * FROM files WHERE id = ?", [Number(id)]);
  if (!row) return NextResponse.json({ error: "File not found." }, { status: 404 });
  if (session.role !== "admin" && row.user_id !== session.userId) {
    return NextResponse.json({ error: "Not your file." }, { status: 403 });
  }

  const p = uploadPath(row.user_id, row.stored_name);
  if (!fs.existsSync(p)) return NextResponse.json({ error: "File is missing from disk." }, { status: 410 });

  const url = new URL(req.url);
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(fs.readFileSync(p)), {
    headers: {
      "Content-Type": row.mime || "application/octet-stream",
      "Content-Disposition": `${disposition}; filename="${row.file_name.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
