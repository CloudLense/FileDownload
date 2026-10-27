import { fetchWithTimeout } from './http';
import { ExtractError, type ExtractResult, type MediaItem } from './types';

// Two public, login-free APIs for X posts: fxtwitter
// (https://github.com/FixTweet/FxTwitter) and vxtwitter
// (https://github.com/dylanpdx/BetterTwitFix). They fail on different posts
// and fxtwitter can take 10 s+, so both are asked at once and the first one
// with media wins.

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
    text: string;
    author: { screen_name: string };
    media?: { all?: FxMedia[] };
  } | null;
}

interface VxMedia {
  type: 'video' | 'gif' | 'image';
  url: string;
  thumbnail_url?: string;
  size?: { width?: number; height?: number };
}

interface VxResponse {
  text?: string;
  user_screen_name?: string;
  media_extended?: VxMedia[];
}

/** Why a source couldn't return the post. */
type Miss = 'not_found' | 'private' | 'no_media' | 'unreachable';

class SourceMiss extends Error {
  constructor(public reason: Miss) {
    super(reason);
  }
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

function quality(width?: number, height?: number): string | undefined {
  return height ? `${Math.min(width ?? height, height)}p` : undefined;
}

function photoUrl(url: string): string {
  const photo = new URL(url);
  photo.searchParams.set('name', 'orig');
  return photo.toString();
}

async function fromFx(id: string): Promise<ExtractResult> {
  let data: FxResponse;
  try {
    const res = await fetchWithTimeout(`https://api.fxtwitter.com/status/${id}`);
    data = (await res.json()) as FxResponse;
  } catch {
    throw new SourceMiss('unreachable');
  }
  if (data.code === 401) throw new SourceMiss('private');
  if (data.code === 404 || !data.tweet) throw new SourceMiss('not_found');
  if (data.code !== 200) throw new SourceMiss('unreachable');

  const media = data.tweet.media?.all ?? [];
  if (media.length === 0) throw new SourceMiss('no_media');
  const n = (i: number) => (media.length > 1 ? `-${i + 1}` : '');
  const items: MediaItem[] = media.map((m, i) => {
    if (m.type === 'photo') {
      return { type: 'photo', url: photoUrl(m.url), thumbnail: m.url, filename: `x-${id}${n(i)}.jpg`, label: 'Original' };
    }
    const best = (m.formats ?? []).filter((f) => f.container === 'mp4').sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
    return {
      type: m.type,
      url: best?.url ?? m.url,
      thumbnail: m.thumbnail_url,
      filename: `x-${id}${n(i)}.mp4`,
      label: quality(m.width, m.height),
    };
  });
  return { platform: 'x', title: data.tweet.text, author: `@${data.tweet.author.screen_name}`, thumbnail: items[0].thumbnail, items };
}

async function fromVx(id: string): Promise<ExtractResult> {
  let data: VxResponse;
  try {
    const res = await fetchWithTimeout(`https://api.vxtwitter.com/Twitter/status/${id}`);
    // vxtwitter answers misses with an HTML page instead of JSON.
    if (!res.headers.get('content-type')?.includes('json')) throw new SourceMiss('not_found');
    data = (await res.json()) as VxResponse;
  } catch (err) {
    throw err instanceof SourceMiss ? err : new SourceMiss('unreachable');
  }

  const media = data.media_extended ?? [];
  if (media.length === 0) throw new SourceMiss('no_media');
  const n = (i: number) => (media.length > 1 ? `-${i + 1}` : '');
  const items: MediaItem[] = media.map((m, i) =>
    m.type === 'image'
      ? { type: 'photo', url: photoUrl(m.url), thumbnail: m.url, filename: `x-${id}${n(i)}.jpg`, label: 'Original' }
      : {
          type: m.type,
          url: m.url,
          thumbnail: m.thumbnail_url,
          filename: `x-${id}${n(i)}.mp4`,
          label: quality(m.size?.width, m.size?.height),
        },
  );
  return {
    platform: 'x',
    title: data.text,
    author: data.user_screen_name ? `@${data.user_screen_name}` : undefined,
    thumbnail: items[0].thumbnail,
    items,
  };
}

/** The most useful explanation among the sources' misses, for the user. */
function explain(misses: Miss[]): ExtractError {
  if (misses.includes('private')) {
    return new ExtractError('This post is from a private account, so it can’t be downloaded.', 403);
  }
  if (misses.includes('no_media')) {
    return new ExtractError('This post has no video or photos to save.', 404);
  }
  if (misses.every((m) => m === 'unreachable')) {
    return new ExtractError('X isn’t responding right now. Try again in a minute.', 502);
  }
  return new ExtractError(
    'X didn’t return this post. It may be deleted, or marked as sensitive: X hides those from apps that aren’t signed in.',
    404,
  );
}

export async function extractTwitter(url: URL): Promise<ExtractResult> {
  const id = tweetId(await expandShortLink(url));
  if (!id) throw new ExtractError('That’s a link to an X profile or page, not a post. Open the post and share it again.');

  try {
    return await Promise.any([fromFx(id), fromVx(id)]);
  } catch (err) {
    const misses = err instanceof AggregateError ? err.errors.map((e) => (e instanceof SourceMiss ? e.reason : 'unreachable')) : [];
    throw explain(misses);
  }
}
