import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/db";
import { addContentVideo, getContentVideos, removeContentVideo } from "@/lib/content";

export async function GET() {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  return NextResponse.json({ ok: true, videos: await getContentVideos() });
}

export async function POST(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { title = "", url = "" } = await req.json().catch(() => ({}));
  if (!String(title ?? "").trim()) return NextResponse.json({ error: "Give the video a title." }, { status: 400 });
  if (!/^https?:\/\//i.test(String(url ?? "").trim())) {
    return NextResponse.json({ error: "Paste a full link starting with http(s)://." }, { status: 400 });
  }

  try {
    const item = await addContentVideo({ title: String(title), url: String(url) });
    await logActivity({
      userId: null,
      actorName: session.name || session.email,
      actorRole: "admin",
      kind: "content_added",
      summary: `Added “${item.title}” to the content library`,
    });
    return NextResponse.json({ ok: true, video: item });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not add that." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await removeContentVideo(String(id));
  return NextResponse.json({ ok: true });
}
