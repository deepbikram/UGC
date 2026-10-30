// The Duolingo-style onboarding wizard: bite-size guideline screens with Next,
// one agree-to-everything screen, a joined celebration, then profile + payout.
// Content reuses DOCS so Admin → Settings wording stays the source of truth.

/** Part 1 screens in order. `doc` keys into DOCS; `complete` lists the journey
 *  steps the wizard marks done so progress stays consistent everywhere. */
export const ONBOARDING_SCREENS = [
  { id: "ob-how", doc: "how-it-works", kicker: "First, how it works" },
  { id: "ob-rules", doc: "working-agreement", kicker: "The rules that keep videos eligible" },
  { id: "ob-payouts", doc: "payouts-explained", kicker: "How money adds up" },
  { id: "ob-faq", doc: "program-faq", kicker: "Quick answers" },
] as const;

/** Journey steps Part 1 + agree complete (examples is covered by the rules
 *  screen, so the Videos module unlocks for submissions afterwards). */
export const ONBOARDING_COMPLETES = [
  "welcome-how",
  "welcome-rules",
  "guidelines-faq",
  "guidelines-examples",
  "videos-payouts",
  "profile-acknowledge",
] as const;

/** The final agree screen aggregates everything Part 1 showed — one list,
 *  one agreement. Keep in sync with DOCS and the acknowledgement checklist. */
export const AGREE_ITEMS = [
  "I will post authentic Band9Prep / IELTS-prep videos on TikTok, Instagram Reels, or YouTube Shorts, using my own face, voice, experience, or reaction, with a clear call to action to visit Band9Prep.",
  "Views count for the first 30 days after each video is posted — and only admin-reviewed eligible views at my confirmed rate produce a payout.",
  "Fake, purchased, or artificially generated views, unrelated content, and misleading claims make content and views ineligible.",
  "The NPR 50–60 per 1,000 views range is fixed.",
  "Payouts happen monthly, after review, via eSewa, Khalti, or bank transfer — and only to payout details I keep up to date.",
  "Any creator account made for this program stays under Band9Prep's full control. If I leave, I hand over login access, stop using it, and do not delete, rename, transfer, or lock it.",
  "I will keep my profile and every submitted video public and accessible so the team can review them.",
  "I will submit every published video URL in the portal and ask questions in Messages — if it is not in the portal, it did not happen.",
] as const;
