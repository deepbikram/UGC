import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { run } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  run("UPDATE users SET seen_intro = 1 WHERE id = ?", [session.userId]);
  return NextResponse.json({ ok: true });
}
