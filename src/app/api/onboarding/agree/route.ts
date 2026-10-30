import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logActivity, run } from "@/lib/db";
import { completeStep, saveFormResponse } from "@/lib/clients";
import { ONBOARDING_COMPLETES } from "@/lib/onboarding";
import { JOURNEY } from "@/lib/journey";

// Part 1 finale: one agreement covering every guideline screen. Records the
// same acknowledgement the old checklist step wrote, completes the guideline
// steps, and marks the intro seen so /onboarding never shows again.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (session.role !== "admin") {
    const { agree } = await req.json().catch(() => ({}));
    if (agree !== true) return NextResponse.json({ error: "Agreement is required to continue." }, { status: 400 });
  }

  const items = JOURNEY.flatMap((m) => m.steps)
    .find((s) => s.id === "profile-acknowledge")?.checklist?.map(() => true) ?? [];
  await saveFormResponse(session.userId, "profile-acknowledge", { items }, true);
  for (const stepId of ONBOARDING_COMPLETES) {
    await completeStep(session.userId, stepId);
  }
  await run("UPDATE users SET seen_intro = true WHERE id = ?", [session.userId]);

  await logActivity({
    userId: session.userId,
    actorName: session.name || session.email,
    actorRole: session.role,
    kind: "onboarding_agree",
    summary: "Agreed to the program guidelines in onboarding",
  });

  return NextResponse.json({ ok: true });
}
