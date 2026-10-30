// The resolved payload each step type needs in the browser. The module page
// builds these on the server so the client components stay pure renderers.
import type { Form } from "./forms";
import type { Module } from "./journey";
import type { Deliverable, FileRow, User } from "./db";
import { DOCS, renderDocHtml } from "./docs";
import { FORMS } from "./forms";

export type StepFile = { id: number; name: string; size: number; createdAt?: string; mime?: string; category?: string };

export type StepData =
  | { kind: "doc"; title: string; minutes: number; html: string }
  | { kind: "form"; form: Form; data: Record<string, string | string[]>; status: string; updatedAt: string }
  | { kind: "upload"; category: string; asks: string[]; files: StepFile[] }
  | { kind: "checklist"; items: string[]; checked: boolean[] }
  | { kind: "action"; label: string; url: string; note: string }
  | { kind: "board"; items: { id: number; title: string; summary: string; status: string; url: string; dueOn: string; reviewNote?: string }[] }
    | {
      kind: "handoff";
      intro: string;
      deliverables: { id: number; title: string; status: string; url: string }[];
      files: StepFile[];
      supportEmail: string;
      projectName: string;
      clientName: string;
      portalName: string;
    };

export type StepContext = {
  forms: Map<string, { data: Record<string, unknown>; status: string; updatedAt: string }>;
  fileRows: FileRow[];
  boardRows: Deliverable[];
  vars: { portal: string; email: string };
  settings: Record<string, string>;
  user: User | undefined;
};

/** Build every step payload for one module from already-fetched rows. */
export async function buildStepData(mod: Module, ctx: StepContext): Promise<Record<string, StepData>> {
  const entries = await Promise.all(
    mod.steps.map(async (step) => {
      if (step.type === "doc" && step.doc) {
        const doc = DOCS[step.doc];
        return [step.id, doc
          ? { kind: "doc", title: doc.title, minutes: doc.minutes, html: await renderDocHtml(step.doc, ctx.vars) }
          : { kind: "doc", title: step.title, minutes: 1, html: "" }] as const;
      } else if (step.type === "form" && step.form) {
        const form = FORMS[step.form];
        const saved = ctx.forms.get(step.form);
        return [step.id, { kind: "form", form, data: (saved?.data ?? {}) as Record<string, string | string[]>, status: saved?.status ?? "draft", updatedAt: saved?.updatedAt ?? "" }] as const;
      } else if (step.type === "upload" && step.upload) {
        return [step.id, {
          kind: "upload",
          category: step.upload.category,
          asks: step.upload.asks,
          files: ctx.fileRows.filter((f) => f.category === step.upload!.category).map((f) => ({ id: f.id, name: f.file_name, size: f.size, createdAt: f.created_at, mime: f.mime })),
        }] as const;
      } else if (step.type === "checklist" && step.checklist) {
        const saved = ctx.forms.get(step.id);
        return [step.id, { kind: "checklist", items: step.checklist, checked: ((saved?.data.items as boolean[]) ?? []) }] as const;
      } else if (step.type === "action" && step.action) {
        const url = step.action.url || (step.action.settingKey ? ctx.settings[step.action.settingKey] ?? "" : "");
        return [step.id, { kind: "action", label: step.action.label, url, note: step.action.note ?? "" }] as const;
      } else if (step.type === "board") {
        return [step.id, {
          kind: "board",
          items: ctx.boardRows.map((d) => ({ id: d.id, title: d.title, summary: d.summary, status: d.status, url: d.url, dueOn: d.due_on, reviewNote: d.review_note })),
        }] as const;
      } else if (step.type === "handoff") {
        const intro = await renderDocHtml("handoff", ctx.vars);
        return [step.id, {
          kind: "handoff",
          intro,
          deliverables: ctx.boardRows.map((d) => ({ id: d.id, title: d.title, status: d.status, url: d.url })),
          files: ctx.fileRows.map((f) => ({ id: f.id, name: f.file_name, size: f.size, category: f.category, url: f.mime === "link" ? f.stored_name : "" })),
          supportEmail: ctx.vars.email,
          projectName: ctx.user?.project_name || ctx.user?.company || "",
          clientName: ctx.user?.name || "",
          portalName: ctx.vars.portal,
        }] as const;
      }
      return [step.id, undefined] as const;
    })
  );
  return Object.fromEntries(entries) as Record<string, StepData>;
}
