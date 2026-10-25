// Single source of truth for the iOS Shortcut, also read by
// scripts/build-shortcut.py. To ship a new version: bump "version" in
// shortcut.json, run the script, import the file into Shortcuts, Share → Copy
// iCloud Link, and paste the link into "icloudUrl".
import shortcut from '../../shortcut.json';

export const SHORTCUT_VERSION: number = shortcut.version;
export const SHORTCUT_UPDATED: string = shortcut.updated;
export const SHORTCUT_ICLOUD_URL: string = process.env.NEXT_PUBLIC_SHORTCUT_ICLOUD_URL || shortcut.icloudUrl;

/** Message for Shortcuts older than the current version, or null if up to date. */
export function shortcutUpdateNotice(version: number): string | null {
  return version < SHORTCUT_VERSION
    ? 'A new version of dwnld is available. Tap OK to open dwnld.in and add it again.'
    : null;
}
