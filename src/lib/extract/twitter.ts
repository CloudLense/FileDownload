import { fetchJson, fetchWithTimeout } from './http';
import { ExtractError, type ExtractResult, type MediaItem } from './types';

// fxtwitter's public API (https://github.com/FixTweet/FxTwitter) returns
// tweet media as JSON without any login.

interface FxFormat {
  url: string;
  container?: string;
  bitrate?: number;
}

interface FxMedia {
  type: 'video' | 'gif' | 'photo';
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  formats?: FxFormat[];
}

interface FxResponse {
  code: number;
  message: string;
  tweet?: {
    id: string;
    text: string;
    author: { screen_name: string; name: string };
    media?: { all?: FxMedia[] };
  };
}

export function tweetId(url: URL): string | null {
  return url.pathname.match(/\/status(?:es)?\/(\d+)/)?.[1] ?? null;
}

async function expandShortLink(url: URL): Promise<URL> {
  if (url.hostname !== 't.co') return url;
  const res = await fetchWithTimeout(url.toString(), { redirect: 'manual' });
  const location = res.headers.get('location');
  return location ? new URL(location, url) : url;
}

export async function extractTwitter(url: URL): Promise<ExtractResult> {
  const id = tweetId(await expandShortLink(url));
  if (!id) throw new ExtractError('That doesn’t look like a link to a post. Open the post and copy its link.');

  const data = await fetchJson<FxResponse>(`https://api.fxtwitter.com/status/${id}`);
  if (data.code === 404 || !data.tweet) throw new ExtractError('Post not found. It may be private or deleted.', 404);
  if (data.code !== 200) throw new ExtractError(`X returned an error: ${data.message}`, 502);

  const { tweet } = data;
  const media = tweet.media?.all ?? [];
  if (media.length === 0) throw new ExtractError('This post has no photos or videos.', 404);

  const items: MediaItem[] = media.map((m, i) => {
    const n = media.length > 1 ? `-${i + 1}` : '';
    if (m.type === 'photo') {
      const photo = new URL(m.url);
      photo.searchParams.set('name', 'orig');
      return { type: 'photo', url: photo.toString(), thumbnail: m.url, filename: `x-${id}${n}.jpg`, label: 'Original' };
    }
    const best = (m.formats ?? [])
      .filter((f) => f.container === 'mp4')
      .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
    return {
      type: m.type,
      url: best?.url ?? m.url,
      thumbnail: m.thumbnail_url,
      filename: `x-${id}${n}.mp4`,
      label: m.height ? `${Math.min(m.width ?? m.height, m.height)}p` : undefined,
    };
  });

  return {
    platform: 'x',
    title: tweet.text,
    author: `@${tweet.author.screen_name}`,
    thumbnail: items[0].thumbnail,
    items,
  };
}
