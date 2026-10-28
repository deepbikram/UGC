// Creator program content for `doc` steps, written as Markdown and rendered
// with `marked`. Edit freely: these are Band9Prep's words to creators.
// {{portal}} and {{email}} are replaced with the values from Admin → Settings.

export type Doc = { id: string; title: string; minutes: number; body: string };

export const DOCS: Record<string, Doc> = {
  "how-it-works": {
    id: "how-it-works",
    title: "How the creator program works",
    minutes: 3,
    body: `
## The program in eight steps

1. **Create your creator account** and complete your profile.
2. **Add the social profiles** where you publish.
3. **Review the content requirements** and example videos.
4. **Create and publish authentic Band9Prep-related videos** on TikTok, Instagram Reels, or YouTube Shorts.
5. **Submit every published video URL** in this portal.
6. **Views are counted for the first 30 days** after each video is posted.
7. **During monthly review**, Band9Prep checks content eligibility and eligible views.
8. **Approved payout is calculated** using your confirmed rate and eligible views, then marked paid once payment has been sent.

## Platforms

TikTok, Instagram Reels, and YouTube Shorts. No other platform counts toward payouts.

## No thresholds that block you

- **No follower-count threshold.** New creators can participate.
- **No fixed video length** and **no limit on how many videos** you may post.

## Money, plainly

- The advertised range is an **indicative NPR 50–60 per 1,000 eligible views**. It is not a guarantee.
- Your **exact rate is confirmed by your campaign representative** and shown in your profile once set.
- Payouts are calculated as **eligible views / 1,000 × your confirmed rate**.
- Review and payment happen **monthly, after review**. Only admin-reviewed eligible views count.

## What keeps views eligible

- Videos should show Band9Prep or relevant IELTS-preparation features, use your own face, voice, experience, or reaction so they feel authentic, and include a clear call to action to visit Band9Prep.
- Keep your profile and video links **accessible** so the team can find and review them.
- Videos are **not approved in advance**. Eligibility is determined during monthly review.
- **Ineligible:** fake, purchased, or artificially generated views; unrelated content; misleading claims.

## Questions

Use **Messages** in the sidebar, or email us at {{email}}. {{portal}} is the one place for your profile, submissions, and payouts — if it is not in the portal, it did not happen.
    `.trim(),
  },
  "working-agreement": {
    id: "working-agreement",
    title: "Program rules and content requirements",
    minutes: 3,
    body: `
This is the short version of the rules. Follow it and your videos stay eligible.

## What each video should contain

- Shows Band9Prep or relevant IELTS-preparation features.
- Uses your own face, voice, experience, or reaction — it should feel authentic, not like an ad read.
- Includes a clear call to action to visit Band9Prep.

## What makes content or views ineligible

- Fake, purchased, or artificially generated views.
- Unrelated content or misleading claims about Band9Prep.
- Videos or profiles the review team cannot access.

## How review works

- Videos are **not pre-approved**. Submit the public URL after posting.
- Each video has a **30-day counting window** starting on its posted date.
- Reported view counts are **evidence, not approval**. An admin reviews and records the eligible views.
- Only **reviewed eligible views** at your **confirmed rate** produce a payout.

## Payouts

- **Monthly, after review** — via eSewa, Khalti, or bank transfer.
- Keep your payout details up to date. If they change after a payout is prepared, tell us immediately so we can re-check it.
- "Paid" in this portal means an admin has recorded that an external payment was sent. No money moves automatically.

## Acknowledgement

Completing the acknowledgement checklist confirms you have read and understood these rules. If the rules change materially, we may ask you to acknowledge a new version.
    `.trim(),
  },
  "program-faq": {
    id: "program-faq",
    title: "FAQ",
    minutes: 2,
    body: `
## Do I need a minimum follower count?

No. There is no follower-count threshold.

## How long should my videos be? How many can I post?

There is no fixed length and no limit on the number of videos.

## Do you approve videos before I post?

No. Eligibility is checked during monthly payment review.

## Which views count?

Views in the first 30 days after the video is posted, on TikTok, Instagram Reels, or YouTube Shorts — provided the content and views are eligible.

## What is the rate?

The indicative range is NPR 50–60 per 1,000 eligible views. Your exact rate is confirmed by your campaign representative. Until a confirmed rate is set for you, no amount shown is final.

## When do I get paid?

Monthly, after review, via eSewa, Khalti, or bank transfer.

## Where do I ask questions?

Use Messages in the sidebar, or email {{email}}.
    `.trim(),
  },
  "payouts-explained": {
    id: "payouts-explained",
    title: "How payouts are calculated",
    minutes: 2,
    body: `
## The formula

**Video payout = eligible views / 1,000 × your confirmed rate per 1,000 views.**

Example only: 20,000 eligible views at NPR 50 per 1,000 = NPR 1,000.

## What each word means

- **Reported views** — the number you submit. Evidence, not approval.
- **Eligible views** — the number an admin records after review. This is the only number payouts use.
- **Indicative rate** — the advertised NPR 50–60 range. Not a guarantee.
- **Confirmed rate** — the exact rate your campaign representative agreed with you. Payouts need this.
- **Estimated amount** — shown before review. Not final.
- **Approved / paid** — reviewed, calculated, and (for paid) recorded as sent.

## Rounding

Amounts are rounded to whole NPR at the final total, not per video. The portal shows the inputs so the calculation is reproducible.
    `.trim(),
  },
  handoff: {
    id: "handoff",
    title: "Your earnings",
    minutes: 1,
    body: `
Your videos, their review states, and your payout history live here. Reported
view counts stay labelled as reported until an admin reviews them — only
reviewed eligible views at your confirmed rate count toward payouts.
    `.trim(),
  },
};

export function renderDoc(body: string, vars: { portal: string; email: string }): string {
  return body.replaceAll("{{portal}}", vars.portal).replaceAll("{{email}}", vars.email);
}
