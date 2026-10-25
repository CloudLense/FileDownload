import { detectPlatform, type PlatformId } from '../platforms';
import { cobaltConfigured, extractCobalt } from './cobalt';
import { extractLinkedIn } from './linkedin';
import { extractTikTok } from './tiktok';
import { extractTwitter } from './twitter';
import { ExtractError, type ExtractResult } from './types';

export { ExtractError } from './types';
export type { ExtractResult, MediaItem } from './types';

const NATIVE: Partial<Record<PlatformId, (url: URL) => Promise<ExtractResult>>> = {
  x: extractTwitter,
  tiktok: extractTikTok,
  linkedin: extractLinkedIn,
};

const DIRECT_FILE = /\.(mp4|mov|webm|m4v|mp3|m4a|wav|jpe?g|png|gif|webp|pdf|zip)$/i;

export async function extract(rawUrl: string): Promise<ExtractResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ExtractError('That doesn’t look like a valid link.', 400);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new ExtractError('Only web links are supported.', 400);
  // Never let the proxy be pointed at internal addresses.
  if (url.hostname === 'localhost' || /^[\d.]+$|^\[|:/.test(url.hostname) || !url.hostname.includes('.')) {
    throw new ExtractError('That doesn’t look like a valid link.', 400);
  }

  const platform = detectPlatform(url).id;
  const native = NATIVE[platform];

  if (native) {
    try {
      return await native(url);
    } catch (err) {
      // A cobalt instance, if configured, gets a second shot at it.
      if (!cobaltConfigured()) throw err;
      console.warn(`[extract] native ${platform} failed, falling back to cobalt:`, err);
    }
  }

  if (platform === 'other' && DIRECT_FILE.test(url.pathname)) {
    const filename = decodeURIComponent(url.pathname.split('/').pop() || 'download');
    const type = /\.(jpe?g|png|gif|webp)$/i.test(filename) ? 'photo' : /\.(mp3|m4a|wav)$/i.test(filename) ? 'audio' : 'video';
    return { platform, title: filename, items: [{ type, url: url.toString(), filename }] };
  }

  if (!cobaltConfigured()) {
    throw new ExtractError(
      platform === 'other' ? 'This link isn’t supported yet.' : `${detectPlatform(url).name} downloads are temporarily unavailable.`,
      platform === 'other' ? 422 : 503,
    );
  }
  return extractCobalt(url, platform);
}
