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
      { id: "primary_platform", label: "Primary platform", type: "select", required: true, half: true, options: ["TikTok", "Instagram Reels", "YouTube Shorts"] },
      { id: "tiktok_url", label: "TikTok profile URL", type: "url", placeholder: "https://tiktok.com/…" },
      { id: "instagram_url", label: "Instagram profile URL", type: "url", placeholder: "https://instagram.com/…" },
      { id: "youtube_url", label: "YouTube profile URL", type: "url", placeholder: "https://youtube.com/…" },
      { id: "followers", label: "Approximate audience / followers (optional)", type: "text", half: true, help: "Optional. Follower count is not an eligibility threshold.", placeholder: "e.g. 12k" },
      { id: "languages", label: "Content language(s)", type: "text", required: true, half: true, placeholder: "e.g. Nepali, English" },
      { id: "niche", label: "Content niche / about you", type: "textarea", required: true, help: "A few lines on what you post and who watches." },
      { id: "portfolio_url", label: "Prior UGC / brand work link (optional)", type: "url", placeholder: "https://" },
      { id: "contact_method", label: "Preferred contact method", type: "select", required: true, half: true, options: ["WhatsApp", "Phone", "Email", "Viber"] },
      { id: "contact_handle", label: "Contact handle / number", type: "text", required: true, half: true, placeholder: "How Band9Prep reaches you" },
      { id: "notes", label: "Anything else / availability (optional)", type: "textarea" },
    ],
  },
  payout_details: {
    id: "payout_details",
    title: "Payout details",
    intro: "Where monthly payouts go. Only fill the section for your chosen method. Keep these current — if they change after a payout is prepared, tell us so we can re-check it.",
    fields: [
      { id: "method", label: "Payout method", type: "select", required: true, options: ["eSewa", "Khalti", "Bank transfer"] },
      { id: "esewa_name", label: "eSewa account holder name", type: "text", half: true, help: "Fill if method is eSewa." },
      { id: "esewa_id", label: "eSewa ID / registered mobile", type: "text", half: true },
      { id: "khalti_name", label: "Khalti account holder name", type: "text", half: true, help: "Fill if method is Khalti." },
      { id: "khalti_id", label: "Khalti ID / registered mobile", type: "text", half: true },
      { id: "bank_holder", label: "Bank account holder name", type: "text", half: true, help: "Fill if method is bank transfer." },
      { id: "bank_name", label: "Bank name", type: "text", half: true },
      { id: "bank_account", label: "Account number", type: "text", half: true },
      { id: "bank_branch", label: "Branch (optional)", type: "text", half: true },
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

/** True when every required field has a non-empty answer. */
export function isFormComplete(form: Form, data: Record<string, unknown>): boolean {
  return form.fields.every((f) => {
    if (!f.required) return true;
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
