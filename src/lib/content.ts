// Admin-curated video library, visible to every creator. Stored as one JSON
// row in `settings` (no migration): [{ id, title, kind, url, createdAt }].
import { getSetting, setSetting } from "./db";
import { detectPlatform, type PlatformKind } from "./platforms";

export type { PlatformKind };
export { PLATFORM_LABEL } from "./platforms";

export type ContentVideo = {
  id: string;
  title: string;
  kind: PlatformKind;
  url: string;
  createdAt: string;
};

const KEY = "content_videos";

function rid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getContentVideos(): Promise<ContentVideo[]> {
  try {
    const raw = await getSetting(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContentVideo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addContentVideo(input: { title: string; url: string }): Promise<ContentVideo> {
  const kind = detectPlatform(input.url);
  if (!kind) throw new Error("Link must be TikTok, Instagram, or YouTube.");
  const item: ContentVideo = {
    id: rid(),
    title: input.title.trim().slice(0, 160),
    kind,
    url: input.url.trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  const current = await getContentVideos();
  await setSetting(KEY, JSON.stringify([item, ...current].slice(0, 200)));
  return item;
}

export async function removeContentVideo(id: string): Promise<void> {
  const current = await getContentVideos();
  await setSetting(KEY, JSON.stringify(current.filter((v) => v.id !== id)));
}
