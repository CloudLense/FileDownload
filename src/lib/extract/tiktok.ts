import { fetchJson } from './http';
import { ExtractError, type ExtractResult, type MediaItem } from './types';

// tikwm.com is a free public TikTok API (watermark-free, ~1 req/s per IP).

interface TikwmResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    title: string;
    cover?: string;
    origin_cover?: string;
    play?: string;
    hdplay?: string;
    size?: number;
    hd_size?: number;
    music?: string;
    images?: string[];
    author?: { unique_id: string; nickname: string };
  };
}

function absolute(u: string): string {
  return u.startsWith('/') ? `https://www.tikwm.com${u}` : u;
}

export async function extractTikTok(url: URL): Promise<ExtractResult> {
  const body = new URLSearchParams({ url: url.toString(), hd: '1' });
  const res = await fetchJson<TikwmResponse>('https://www.tikwm.com/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const d = res.data;
  if (res.code !== 0 || !d) {
    throw new ExtractError(
      /limit/i.test(res.msg) ? 'TikTok is busy right now. Try again in a few seconds.' : 'TikTok video not found. It may be private or deleted.',
      res.code === -1 ? 404 : 502,
    );
  }

  const thumbnail = d.origin_cover || d.cover;
  const items: MediaItem[] = [];
  if (d.images?.length) {
    d.images.forEach((img, i) =>
      items.push({ type: 'photo', url: absolute(img), thumbnail: absolute(img), filename: `tiktok-${d.id}-${i + 1}.jpg` }),
    );
  } else {
    const video = d.hdplay || d.play;
    if (video) {
      items.push({
        type: 'video',
        url: absolute(video),
        thumbnail,
        filename: `tiktok-${d.id}.mp4`,
        label: d.hdplay ? 'HD · no watermark' : 'No watermark',
        size: (d.hdplay ? d.hd_size : d.size) || undefined,
      });
    }
  }
  if (d.music) items.push({ type: 'audio', url: absolute(d.music), filename: `tiktok-${d.id}-sound.mp3`, label: 'Sound' });
  if (items.length === 0) throw new ExtractError('No downloadable media found in this TikTok.', 404);

  return {
    platform: 'tiktok',
    title: d.title,
    author: d.author ? `@${d.author.unique_id}` : undefined,
    thumbnail,
    items,
  };
}
