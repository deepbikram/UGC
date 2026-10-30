// Intake forms. Each form is a list of fields; answers are stored as one JSON
// blob per (user, form) in `form_responses`, so adding a field never needs a
// migration. Drafts save as the client types; submitting completes the step.

export type FieldType = "text" | "textarea" | "email" | "url" | "select" | "multiselect" | "number";

export type Field = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: string[];
  /** Renders two fields side by side on wide screens. */
  half?: boolean;
  /** Show this field only when another field's answer matches. For
   *  multiselect answers use `includes`; for anything else use `equals`. */
  visibleIf?: { field: string; includes?: string; equals?: string };
};

export type Form = {
  id: string;
  title: string;
  intro: string;
  fields: Field[];
};

export const FORMS: Record<string, Form> = {
  creator_profile: {
    id: "creator_profile",
    title: "Creator profile",
    intro: "Who you are and where you publish. Follower count is optional — it is not an eligibility threshold.",
    fields: [
      { id: "full_name", label: "Full name", type: "text", required: true, half: true, placeholder: "Your name" },
      { id: "phone", label: "Phone / WhatsApp", type: "text", required: true, half: true, placeholder: "+977 …" },
      { id: "country", label: "Country", type: "text", required: true, half: true, placeholder: "Nepal" },
      { id: "city", label: "City", type: "text", half: true, placeholder: "Kathmandu" },
      { id: "display_name", label: "Creator display name / handle", type: "text", required: true, half: true, placeholder: "@yourhandle" },
      { id: "primary_platform", label: "Platforms you publish on", type: "multiselect", required: true, options: ["TikTok", "Instagram Reels", "YouTube Shorts"], help: "Pick all that apply — at least one." },
      { id: "tiktok_url", label: "TikTok profile URL", type: "url", placeholder: "https://tiktok.com/…", visibleIf: { field: "primary_platform", includes: "TikTok" } },
      { id: "instagram_url", label: "Instagram profile URL", type: "url", placeholder: "https://instagram.com/…", visibleIf: { field: "primary_platform", includes: "Instagram Reels" } },
      { id: "youtube_url", label: "YouTube profile URL", type: "url", placeholder: "https://youtube.com/…", visibleIf: { field: "primary_platform", includes: "YouTube Shorts" } },
      { id: "languages", label: "Content language(s)", type: "text", required: true, half: true, placeholder: "e.g. Nepali, English" },
    ],
  },
  payout_details: {
    id: "payout_details",
    title: "Payout details",
    intro: "Where monthly payouts go. Only your chosen method's fields appear. Keep these current — if they change after a payout is prepared, tell us so we can re-check it.",
    fields: [
      { id: "method", label: "Payout method", type: "select", required: true, half: true, options: ["eSewa", "Khalti", "Bank transfer"] },
      { id: "esewa_name", label: "eSewa account holder name", type: "text", half: true, visibleIf: { field: "method", equals: "eSewa" } },
      { id: "esewa_id", label: "eSewa ID / registered mobile", type: "text", half: true, visibleIf: { field: "method", equals: "eSewa" } },
      { id: "khalti_name", label: "Khalti account holder name", type: "text", half: true, visibleIf: { field: "method", equals: "Khalti" } },
      { id: "khalti_id", label: "Khalti ID / registered mobile", type: "text", half: true, visibleIf: { field: "method", equals: "Khalti" } },
      { id: "bank_holder", label: "Bank account holder name", type: "text", half: true, visibleIf: { field: "method", equals: "Bank transfer" } },
      { id: "bank_name", label: "Bank name", type: "text", half: true, visibleIf: { field: "method", equals: "Bank transfer" } },
      { id: "bank_account", label: "Account number", type: "text", half: true, visibleIf: { field: "method", equals: "Bank transfer" } },
      { id: "bank_branch", label: "Branch (optional)", type: "text", half: true, visibleIf: { field: "method", equals: "Bank transfer" } },
    ],
  },
  feedback: {
    id: "feedback",
    title: "Consolidated feedback",
    intro: "Collect your team's notes, then send them once. Scattered feedback is the most expensive thing in a project.",
    fields: [
      {
        id: "overall",
        label: "Overall reaction",
        type: "select",
        required: true,
        options: ["On the money", "Close, needs refinement", "Right direction, wrong execution", "Not what we expected"],
      },
      { id: "keep", label: "What should we keep?", type: "textarea", required: true, help: "Be specific. Naming what works stops us from changing it." },
      { id: "change", label: "What needs to change?", type: "textarea", required: true, help: "One change per line, with the reason behind it." },
      { id: "blockers", label: "Anything blocking approval?", type: "textarea" },
      { id: "reviewers", label: "Who reviewed this round?", type: "text", placeholder: "Names or roles" },
    ],
  },
};

export function getForm(id: string): Form | undefined {
  return FORMS[id];
}

/** The platforms a creator picked, as an array — tolerates the old
 *  single-select string saved before platforms became multi-pick. */
function platformPicks(data: Record<string, unknown>): string[] {
  const v = data["primary_platform"];
  if (Array.isArray(v)) return v.map(String);
  return typeof v === "string" && v ? [v] : [];
}

/** False when a `visibleIf` rule hides the field for the current answers. */
export function isFieldVisible(field: Field, data: Record<string, unknown>): boolean {
  const rule = field.visibleIf;
  if (!rule) return true;
  const v = data[rule.field];
  if (rule.includes !== undefined) {
    return Array.isArray(v) ? v.map(String).includes(rule.includes) : String(v ?? "") === rule.includes;
  }
  if (rule.equals !== undefined) {
    return String(v ?? "") === rule.equals;
  }
  return true;
}

/** True when every required field has a non-empty answer. */
export function isFieldRequired(field: Field, data: Record<string, unknown>): boolean {
  if (field.required) return true;
  const picks = platformPicks(data);
  if (field.id === "tiktok_url") return picks.includes("TikTok");
  if (field.id === "instagram_url") return picks.includes("Instagram Reels");
  if (field.id === "youtube_url") return picks.includes("YouTube Shorts");
  const method = String(data["method"] ?? "");
  if (field.id === "esewa_name" || field.id === "esewa_id") return method === "eSewa";
  if (field.id === "khalti_name" || field.id === "khalti_id") return method === "Khalti";
  if (field.id === "bank_holder" || field.id === "bank_name" || field.id === "bank_account") return method === "Bank transfer";
  return false;
}

/** True when every required field has a non-empty answer. */
export function isFormComplete(form: Form, data: Record<string, unknown>): boolean {
  return form.fields.every((f) => {
    if (!isFieldVisible(f, data)) return true;
    if (!isFieldRequired(f, data)) return true;
    const v = data[f.id];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null;
  });
}

/** Human-readable answer for admin views and the handoff pack. */
export function answerText(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}
