import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/db";
import { saveSettings } from "@/lib/settings";
import { SETTINGS_SCHEMA } from "@/lib/brand";

const ALLOWED: Set<string> = new Set(SETTINGS_SCHEMA.flatMap((g) => g.keys.map((k) => k.key)));

export async function POST(req: Request) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) patch[k] = String(v ?? "").slice(0, 4000);
  }
  saveSettings(patch);
  logActivity({ actorName: session.name || session.email, actorRole: "admin", kind: "settings", summary: `Updated portal settings` });

  return NextResponse.json({ ok: true });
}
