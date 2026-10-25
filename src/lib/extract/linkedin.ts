import { decodeHtmlEntities, fetchWithTimeout, metaContent } from './http';
import { ExtractError, type ExtractResult, type MediaItem } from './types';

// Public LinkedIn posts render server-side with the video sources in a
// `data-sources` attribute and the image/thumbnail in og:image.

interface VideoSource {
  src: string;
  type?: string;
  'data-bitrate'?: number;
}

export async function extractLinkedIn(url: URL): Promise<ExtractResult> {
  const res = await fetchWithTimeout(url.toString(), { redirect: 'follow' });
  if (!res.ok) throw new ExtractError('LinkedIn post not found. Only public posts can be downloaded.', 404);
  const html = await res.text();

  const id = html.match(/urn:li:(?:activity|ugcPost|share):(\d+)/)?.[1] ?? 'post';
  const ogTitle = metaContent(html, 'og:title');
  const title = ogTitle && decodeHtmlEntities(ogTitle); // LinkedIn double-encodes entities
  const image = metaContent(html, 'og:image');

  const sourcesAttr = html.match(/data-sources="([^"]+)"/)?.[1];
  if (sourcesAttr) {
    const sources = JSON.parse(decodeHtmlEntities(sourcesAttr)) as VideoSource[];
    const best = sources
      .filter((s) => !s.type || s.type.includes('mp4'))
      .sort((a, b) => (b['data-bitrate'] ?? 0) - (a['data-bitrate'] ?? 0))[0];
    if (best) {
      const quality = best.src.match(/mp4-(\d+p)/)?.[1];
      return {
        platform: 'linkedin',
        title,
        thumbnail: image,
        items: [{ type: 'video', url: best.src, thumbnail: image, filename: `linkedin-${id}.mp4`, label: quality }],
      };
    }
  }

  // Image posts: collect every feed image; fall back to og:image.
  const images = [...new Set([...html.matchAll(/data-delayed-url="(https:\/\/media\.licdn\.com\/dms\/image\/[^"]+feedshare[^"]+)"/g)].map((m) => decodeHtmlEntities(m[1])))];
  const photos = images.length ? images : image && !/static\.licdn\.com/.test(image) ? [image] : [];
  if (photos.length === 0) throw new ExtractError('This LinkedIn post has no video or images to download.', 404);

  const items: MediaItem[] = photos.map((p, i) => ({
    type: 'photo',
    url: p,
    thumbnail: p,
    filename: `linkedin-${id}${photos.length > 1 ? `-${i + 1}` : ''}.jpg`,
  }));
  return { platform: 'linkedin', title, thumbnail: photos[0], items };
}
