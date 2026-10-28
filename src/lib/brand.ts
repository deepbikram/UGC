// Band9Prep Creator Partnerships defaults. Everything here is overridable at
// runtime from Admin → Settings, so rebranding never needs a code change: the
// values below are only the fallbacks a fresh install starts with.
// ponytail: program settings are plain settings-table keys — no migration.

export const BRAND = {
  name: "Band9Prep Creator Partnerships",
  tagline: "Create authentic IELTS-prep videos. Get paid per eligible view.",
  description:
    "The Band9Prep creator portal: onboarding, guidelines, video submissions, and payouts in one calm place.",
  supportEmail: "hello@band9prep.com",
  site: "https://band9prep.com",
  /** Coal, ink, and one warm stone accent. */
  colors: { coal: "#0b0b0a", ink: "#f4f3ef", accent: "#d8cfc0" },
} as const;

/** Runtime-editable settings, with their defaults and how the admin UI labels them. */
export const SETTINGS_SCHEMA = [
  {
    group: "Brand",
    keys: [
      { key: "portal_name", label: "Portal name", help: "Shown in the sidebar, the login screen, and every email-style message.", default: BRAND.name },
      { key: "portal_tagline", label: "Tagline", help: "One line under the wordmark on the login screen.", default: BRAND.tagline },
      { key: "accent_color", label: "Accent colour", help: "Hex value used for progress, focus rings, and the active state.", default: BRAND.colors.accent, type: "color" },
      { key: "support_email", label: "Support email", help: "Where clients are told to reach you.", default: BRAND.supportEmail },
    ],
  },
  {
    group: "Creator program",
    keys: [
      { key: "welcome_headline", label: "Welcome headline", help: "The first line a new creator reads on the intro screen.", default: "Welcome to the Band9Prep Creator Program." },
      { key: "welcome_body", label: "Welcome body", help: "A short paragraph under the headline.", default: "Everything for the program lives in this portal: your profile, the guidelines, your video submissions, and your payouts. Work through it in order — the next module unlocks as you finish the one before it.", type: "textarea" },
      { key: "rate_min", label: "Indicative rate (min, NPR per 1,000 eligible views)", help: "Lower end of the advertised indicative range. A creator's exact rate is confirmed separately.", default: "50" },
      { key: "rate_max", label: "Indicative rate (max, NPR per 1,000 eligible views)", help: "Upper end of the advertised indicative range.", default: "60" },
      { key: "counting_window_days", label: "View-counting window (days)", help: "Days after posting during which views count as eligible.", default: "30" },
      { key: "platforms", label: "Supported platforms", help: "Comma-separated list shown to creators.", default: "TikTok, Instagram Reels, YouTube Shorts" },
      { key: "resources_url", label: "Resources link", help: "Optional link to a shared drive or handbook.", default: "" },
    ],
  },
] as const;

export const SETTING_DEFAULTS: Record<string, string> = Object.fromEntries(
  SETTINGS_SCHEMA.flatMap((g) => g.keys.map((k) => [k.key, k.default]))
);
