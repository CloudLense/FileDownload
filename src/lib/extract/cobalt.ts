import type { PlatformId } from '../platforms';
import { fetchWithTimeout } from './http';
import { ExtractError, type ExtractResult, type MediaItem, type MediaType } from './types';

// Optional backend: a self-hosted cobalt instance (https://github.com/imputnet/cobalt).
// Covers YouTube, Instagram, Facebook, Reddit, Pinterest and more. Configure with
// COBALT_API_URL and (if your instance requires it) COBALT_API_KEY.

interface CobaltResponse {
  status: 'tunnel' | 'redirect' | 'picker' | 'local-processing' | 'error';
  url?: string;
  filename?: string;
  picker?: { type: 'photo' | 'video' | 'gif'; url: string; thumb?: string }[];
  audio?: string;
  audioFilename?: string;
  error?: { code: string; context?: { service?: string; limit?: number } };
}

export function cobaltConfigured(): boolean {
  return Boolean(process.env.COBALT_API_URL);
}

function typeFromFilename(filename: string): MediaType {
  if (/\.(mp3|ogg|opus|wav|m4a)$/i.test(filename)) return 'audio';
  if (/\.(jpe?g|png|webp|gif)$/i.test(filename)) return 'photo';
  return 'video';
}

function friendlyError(code: string): ExtractError {
  if (code.includes('content.too_long')) return new ExtractError('This video is too long to download.', 422);
  if (code.includes('unavailable') || code.includes('private') || code.includes('empty')) {
    return new ExtractError('This post is unavailable. It may be private, age-restricted or deleted.', 404);
  }
  if (code.includes('rate_exceeded')) return new ExtractError('Too many downloads right now. Try again in a minute.', 429);
  if (code.includes('link.unsupported') || code.includes('service.unsupported')) {
    return new ExtractError('This link isn’t supported yet.', 422);
  }
  return new ExtractError('Couldn’t fetch this post. Please try again.', 502);
}

export async function extractCobalt(url: URL, platform: PlatformId): Promise<ExtractResult> {
  const endpoint = process.env.COBALT_API_URL;
  if (!endpoint) throw new ExtractError('This platform isn’t available right now.', 503);

  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (process.env.COBALT_API_KEY) headers.Authorization = `Api-Key ${process.env.COBALT_API_KEY}`;

  const res = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: url.toString(), videoQuality: '1080', filenameStyle: 'basic' }),
  });
  const data = (await res.json().catch(() => null)) as CobaltResponse | null;
  if (!data) throw new ExtractError('The download backend returned an invalid response.', 502);
  if (data.status === 'error') throw friendlyError(data.error?.code ?? '');

  let items: MediaItem[] = [];
  if ((data.status === 'tunnel' || data.status === 'redirect') && data.url) {
    const filename = data.filename ?? 'download.mp4';
    items = [{ type: typeFromFilename(filename), url: data.url, filename }];
  } else if (data.status === 'picker' && data.picker) {
    items = data.picker.map((p, i) => ({
      type: p.type,
      url: p.url,
      thumbnail: p.thumb ?? (p.type === 'photo' ? p.url : undefined),
      filename: `${platform}-${i + 1}.${p.type === 'photo' ? 'jpg' : 'mp4'}`,
    }));
    if (data.audio) items.push({ type: 'audio', url: data.audio, filename: data.audioFilename ?? `${platform}-audio.mp3`, label: 'Audio' });
  } else {
    // local-processing needs a browser-side muxer; we don't request it, so treat as unsupported.
    throw new ExtractError('This format can’t be downloaded yet.', 422);
  }

  if (items.length === 0) throw new ExtractError('No downloadable media found.', 404);
  return { platform, thumbnail: items.find((i) => i.thumbnail)?.thumbnail, items };
}
