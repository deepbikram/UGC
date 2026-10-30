// Client-safe platform helpers (no server imports here).
export type PlatformKind = "tiktok" | "instagram" | "youtube";

export const PLATFORM_LABEL: Record<PlatformKind, string> = {
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};

/** Detect the platform from a URL, or null when it matches none. */
export function detectPlatform(url: string): PlatformKind | null {
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/(youtube\.com|youtu\.be)/i.test(url)) return "youtube";
  return null;
}
