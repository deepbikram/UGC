import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/db";
import { completeStep, formResponse, uncompleteStep } from "@/lib/clients";
import { ALL_STEP_IDS, ALL_STEPS, moduleOf } from "@/lib/journey";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { stepId, done = true, userId } = await req.json().catch(() => ({}));
  if (!ALL_STEP_IDS.has(String(stepId))) return NextResponse.json({ error: "Unknown step." }, { status: 400 });

  // Admins can tick a step on a client's behalf; clients only ever touch their own.
  const targetId = session.role === "admin" && userId ? Number(userId) : session.userId;

  // Checklist steps (acknowledgements) require every box ticked — no skipping
  // with zero checked, even via a direct API call.
  if (done) {
    const step = ALL_STEPS.find((s) => s.id === String(stepId));
    if (step?.type === "checklist") {
      const saved = await formResponse(targetId, String(stepId));
      const items = (saved.data as { items?: unknown }).items;
      const expected = step.checklist?.length ?? 0;
      if (!Array.isArray(items) || items.length !== expected || !items.every((v) => v === true)) {
        return NextResponse.json({ error: "Tick every box to continue." }, { status: 400 });
      }
    }
    await completeStep(targetId, String(stepId));
  } else await uncompleteStep(targetId, String(stepId));

  const step = ALL_STEPS.find((s) => s.id === stepId);
  await logActivity({
    userId: targetId,
    actorName: session.name || session.email,
    actorRole: session.role,
    kind: done ? "step_complete" : "step_reopen",
    summary: `${done ? "Completed" : "Reopened"} “${step?.title ?? stepId}” in ${moduleOf(String(stepId))?.title ?? "the journey"}`,
  });

  return NextResponse.json({ ok: true });
}
