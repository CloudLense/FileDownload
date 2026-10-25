// Single source of truth for the iOS Shortcut, also read by
// scripts/build-shortcut.py. To ship a new version: bump "version" in
// shortcut.json, run the script, import the file into Shortcuts, Share → Copy
// iCloud Link, and paste the link into "icloudUrl".
import shortcut from '../../shortcut.json';

export const SHORTCUT_VERSION: number = shortcut.version;
export const SHORTCUT_UPDATED: string = shortcut.updated;
export const SHORTCUT_ICLOUD_URL: string = process.env.NEXT_PUBLIC_SHORTCUT_ICLOUD_URL || shortcut.icloudUrl;

export interface ShortcutUpdate {
  /** v1–v5 show this in an alert whose OK opens dwnld.in/shortcut. */
  update: string;
  /** v6+ show this above "Update now" / "Keep using vN" before downloading. */
  updatePrompt: string;
}

/** Update fields for Shortcuts older than the current version, or null if up to date. */
export function shortcutUpdate(version: number): ShortcutUpdate | null {
  if (version >= SHORTCUT_VERSION) return null;
  const headline = `dwnld v${SHORTCUT_VERSION} is available (you have v${version}).`;
  return {
    update: `${headline} Tap OK to get it, or Cancel to keep this one.`,
    updatePrompt: headline,
  };
}

/** "Saved 1 video to Photos", "Saved 3 photos to Photos", "Saved 2 items to Photos". */
export function savedSummary(types: string[]): string {
  const n = types.length;
  const kinds = new Set(types.map((t) => (t === 'photo' ? 'photo' : 'video')));
  const noun = kinds.size > 1 ? 'item' : [...kinds][0] ?? 'item';
  return `Saved ${n} ${noun}${n === 1 ? '' : 's'} to Photos`;
}
