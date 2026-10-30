// The resolved payload each step type needs in the browser. The module page
// builds these on the server so the client components stay pure renderers.
import type { Form } from "./forms";

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
