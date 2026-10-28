// The creator journey: an ordered list of modules, each an ordered list of
// steps. Completion is a row in `progress` keyed by step id, and a module
// unlocks once every module before it is finished.
//
// This file is the one place to edit when you want a different program
// shape. Add, remove, or reorder modules and steps freely — nothing else in
// the app hardcodes a step id.
//
// ponytail: video submissions reuse the `deliverables` table (one row per
// video, `kind` = platform, `url` = video URL) and payouts/earnings are
// derived from reviewed rows + settings rates — no new tables yet.

export type StepType = "doc" | "form" | "upload" | "action" | "checklist" | "board" | "handoff";

export type Step = {
  id: string;
  title: string;
  description: string;
  type: StepType;
  /** `doc` steps: key into DOCS. */
  doc?: string;
  /** `form` steps: key into FORMS. */
  form?: string;
  /** `upload` steps: which bucket the files land in, and what to ask for. */
  upload?: { category: string; asks: string[] };
  /** `action` steps: an external link, optionally from a setting. */
  action?: { label: string; settingKey?: string; url?: string; note?: string };
  /** `checklist` steps: the items to tick. */
  checklist?: string[];
};

export type Module = {
  slug: string;
  title: string;
  description: string;
  steps: Step[];
};

export const JOURNEY: Module[] = [
  {
    slug: "welcome",
    title: "Welcome",
    description: "How the Band9Prep Creator Program works and the rules that keep your videos eligible.",
    steps: [
      {
        id: "welcome-how",
        title: "How the program works",
        description: "Platforms, the 30-day counting window, monthly review, and how payouts are calculated.",
        type: "doc",
        doc: "how-it-works",
      },
      {
        id: "welcome-rules",
        title: "Program rules",
        description: "What each video must contain and what makes content or views ineligible.",
        type: "doc",
        doc: "working-agreement",
      },
    ],
  },
  {
    slug: "profile",
    title: "Profile & payout",
    description: "Who you are, where you publish, and where monthly payouts go.",
    steps: [
      {
        id: "profile-creator",
        title: "Creator profile",
        description: "Your contact details, social profiles, languages, and niche.",
        type: "form",
        form: "creator_profile",
      },
      {
        id: "profile-payout",
        title: "Payout details",
        description: "eSewa, Khalti, or bank transfer — only fill your chosen method.",
        type: "form",
        form: "payout_details",
      },
      {
        id: "profile-acknowledge",
        title: "Acknowledge the guidelines",
        description: "Confirm you have read and understood the program rules.",
        type: "checklist",
        checklist: [
          "I have read the program rules and content requirements",
          "I understand the indicative rate (NPR 50–60 per 1,000 eligible views) is not a guarantee",
          "I understand my exact rate is confirmed by my campaign representative",
          "I understand views count for 30 days after posting and eligibility is checked at monthly review",
          "I will keep my profile and video links accessible for review",
        ],
      },
    ],
  },
  {
    slug: "guidelines",
    title: "Guidelines & examples",
    description: "Creative guidance, answers, and example videos from the Band9Prep team.",
    steps: [
      {
        id: "guidelines-faq",
        title: "FAQ",
        description: "Thresholds, video length, pre-approval, rates, and payment timing.",
        type: "doc",
        doc: "program-faq",
      },
      {
        id: "guidelines-examples",
        title: "Example videos",
        description: "Watch what good looks like before you film.",
        type: "action",
        action: {
          label: "Open example videos",
          settingKey: "resources_url",
          note: "Set the link in Admin → Settings → Resources link. Until then, ask your campaign representative for examples.",
        },
      },
    ],
  },
  {
    slug: "videos",
    title: "Videos & earnings",
    description: "Submit published videos, attach view evidence, and see how payouts add up.",
    steps: [
      {
        id: "videos-board",
        title: "Your video submissions",
        description: "One record per published video. Your admin adds rows from the admin side for now.",
        type: "board",
      },
      {
        id: "videos-evidence",
        title: "View evidence",
        description: "Screenshots of platform analytics (e.g. TikTok Studio) for your submitted videos.",
        type: "upload",
        upload: {
          category: "evidence",
          asks: [
            "Screenshot of analytics for each submitted video",
            "Capture the view count and the date visibly",
            "One file per video is enough",
          ],
        },
      },
      {
        id: "videos-payouts",
        title: "How payouts are calculated",
        description: "Eligible views, confirmed rate, and what each amount label means.",
        type: "doc",
        doc: "payouts-explained",
      },
    ],
  },
];

export const ALL_STEPS: Step[] = JOURNEY.flatMap((m) => m.steps);
export const ALL_STEP_IDS = new Set(ALL_STEPS.map((s) => s.id));

export function getModule(slug: string): Module | undefined {
  return JOURNEY.find((m) => m.slug === slug);
}

export function moduleOf(stepId: string): Module | undefined {
  return JOURNEY.find((m) => m.steps.some((s) => s.id === stepId));
}

export function isModuleComplete(mod: Module, completed: Set<string>): boolean {
  return mod.steps.length > 0 && mod.steps.every((s) => completed.has(s.id));
}

/** Sequential gating, with finished modules always reachable again. */
export function isModuleUnlocked(index: number, completed: Set<string>): boolean {
  const mod = JOURNEY[index];
  if (!mod) return false;
  if (isModuleComplete(mod, completed)) return true;
  return JOURNEY.slice(0, index).every((m) => isModuleComplete(m, completed));
}

export function blockingModuleTitle(index: number, completed: Set<string>): string | null {
  return JOURNEY.slice(0, index).find((m) => !isModuleComplete(m, completed))?.title ?? null;
}

export function journeyStats(completed: Set<string>, admin = false) {
  const done = ALL_STEPS.filter((s) => completed.has(s.id)).length;
  const nextIndex = JOURNEY.findIndex((m, i) => {
    const d = m.steps.filter((s) => completed.has(s.id)).length;
    return (admin || isModuleUnlocked(i, completed)) && d < m.steps.length;
  });
  return {
    total: ALL_STEPS.length,
    done,
    pct: ALL_STEPS.length ? Math.round((done / ALL_STEPS.length) * 100) : 0,
    complete: ALL_STEPS.length > 0 && done === ALL_STEPS.length,
    nextIndex,
    nextModule: nextIndex >= 0 ? JOURNEY[nextIndex] : null,
  };
}

/** Coarse phase label used in the admin list. */
export function phaseFor(completed: Set<string>): string {
  if (completed.size === 0) return "Invited";
  const stats = journeyStats(completed);
  if (stats.complete) return "Complete";
  return JOURNEY[stats.nextIndex >= 0 ? stats.nextIndex : 0].title;
}
