import { ExtractError } from './types';

export const USER_AGENT = 'Mozilla/5.0 (compatible; dwnld.in/2.0; +https://dwnld.in)';

// Netlify's free tier kills synchronous functions after 10s; leave headroom.
const TIMEOUT_MS = 8000;

export async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      headers: { 'User-Agent': USER_AGENT, ...init.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new ExtractError('The site is taking too long to respond. Try again in a minute.', 504);
    }
    throw new ExtractError('Couldn’t reach the site right now. Try again in a minute.', 502);
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithTimeout(url, init);
  if (!res.ok) throw new ExtractError('Couldn’t get this post right now. Try again in a minute.', 502);
  return (await res.json()) as T;
}

export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function metaContent(html: string, property: string): string | undefined {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`, 'i');
  const m = html.match(re);
  return m ? decodeHtmlEntities(m[1]) : undefined;
}

export function extFromUrl(url: string, fallback: string): string {
  const m = new URL(url).pathname.match(/\.([a-z0-9]{2,4})$/i);
  return m ? m[1].toLowerCase() : fallback;
}
