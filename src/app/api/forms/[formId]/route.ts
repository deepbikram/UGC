import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/db";
import { completeStep, saveFormResponse } from "@/lib/clients";
import { getForm, isFormComplete } from "@/lib/forms";
import { ALL_STEPS } from "@/lib/journey";

export async function POST(req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { formId } = await params;
  const form = getForm(formId);
  const checklistStep = !form ? ALL_STEPS.find((s) => s.id === formId && s.type === "checklist") : undefined;
  if (!form && !checklistStep) return NextResponse.json({ error: "Unknown form." }, { status: 404 });

  const { data, submit = false } = await req.json().catch(() => ({}));

  // Checklist steps (e.g. profile-acknowledge) persist { items: boolean[] }.
  if (checklistStep) {
    const raw = (data ?? {}).items;
    const items = Array.isArray(raw) ? raw.map((v) => v === true) : [];
    const expected = checklistStep.checklist?.length ?? items.length;
    if (submit && !(items.length === expected && items.every(Boolean))) {
      return NextResponse.json({ error: "Tick every box to continue." }, { status: 400 });
    }
    await saveFormResponse(session.userId, formId, { items }, Boolean(submit));
    if (submit) {
      await completeStep(session.userId, checklistStep.id);
      await logActivity({
        userId: session.userId,
        actorName: session.name || session.email,
        actorRole: session.role,
        kind: "form_submit",
        summary: `Acknowledged “${checklistStep.title}”`,
      });
    }
    return NextResponse.json({ ok: true, submitted: Boolean(submit) });
  }
  if (!form) return NextResponse.json({ error: "Unknown form." }, { status: 404 });
  const clean: Record<string, unknown> = {};
  for (const field of form.fields) {
    const v = (data ?? {})[field.id];
    if (Array.isArray(v)) clean[field.id] = v.map(String).slice(0, 40);
    else if (v !== undefined && v !== null) clean[field.id] = String(v).slice(0, 8000);
  }

  if (submit && !isFormComplete(form, clean)) {
    return NextResponse.json({ error: "Some required answers are still blank." }, { status: 400 });
  }

  await saveFormResponse(session.userId, formId, clean, Boolean(submit));

  if (submit) {
    const step = ALL_STEPS.find((s) => s.form === formId);
    if (step) await completeStep(session.userId, step.id);
    await logActivity({
      userId: session.userId,
      actorName: session.name || session.email,
      actorRole: session.role,
      kind: "form_submit",
      summary: `Submitted “${form.title}”`,
    });
  }

  return NextResponse.json({ ok: true, submitted: Boolean(submit) });
}
