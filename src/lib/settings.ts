import { all, setSetting } from "./db";
import { SETTING_DEFAULTS } from "./brand";

export type PortalSettings = Record<string, string>;

/** Every setting, with code defaults filled in for anything never edited. */
export function getSettings(): PortalSettings {
  const rows = all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const merged: PortalSettings = { ...SETTING_DEFAULTS };
  for (const [k, v] of Object.entries(stored)) {
    if (v !== "") merged[k] = v;
    else if (k in SETTING_DEFAULTS) merged[k] = "";
  }
  return merged;
}

export function saveSettings(patch: Record<string, string>) {
  for (const [key, value] of Object.entries(patch)) setSetting(key, String(value ?? ""));
}

/** A hex colour we are willing to inject into a style attribute. */
export function safeColor(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}
