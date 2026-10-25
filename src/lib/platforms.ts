// Client-safe platform detection, shared by the UI and the API.

export type PlatformId =
  | 'instagram'
  | 'tiktok'
  | 'x'
  | 'linkedin'
  | 'youtube'
  | 'facebook'
  | 'reddit'
  | 'pinterest'
  | 'threads'
  | 'other';

export interface Platform {
  id: PlatformId;
  name: string;
  /** brand-ish accent used for chips */
  color: string;
  hosts: string[];
  /** shown in the "works with" row on the home page */
  featured?: boolean;
}

export const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', color: '#e1306c', hosts: ['instagram.com', 'instagr.am', 'ig.me'], featured: true },
  { id: 'tiktok', name: 'TikTok', color: '#25f4ee', hosts: ['tiktok.com', 'douyin.com'], featured: true },
  { id: 'x', name: 'X / Twitter', color: '#8899a6', hosts: ['x.com', 'twitter.com', 't.co', 'fxtwitter.com', 'vxtwitter.com', 'fixupx.com'], featured: true },
  { id: 'linkedin', name: 'LinkedIn', color: '#0a66c2', hosts: ['linkedin.com', 'lnkd.in'], featured: true },
  { id: 'youtube', name: 'YouTube', color: '#ff0033', hosts: ['youtube.com', 'youtu.be'], featured: true },
  { id: 'facebook', name: 'Facebook', color: '#1877f2', hosts: ['facebook.com', 'fb.watch', 'fb.com'] },
  { id: 'reddit', name: 'Reddit', color: '#ff4500', hosts: ['reddit.com', 'redd.it'] },
  { id: 'pinterest', name: 'Pinterest', color: '#e60023', hosts: ['pinterest.com', 'pin.it'] },
  { id: 'threads', name: 'Threads', color: '#999999', hosts: ['threads.net', 'threads.com'] },
];

const OTHER: Platform = { id: 'other', name: 'Link', color: '#888888', hosts: [] };

function hostMatches(hostname: string, host: string): boolean {
  return hostname === host || hostname.endsWith(`.${host}`);
}

export function detectPlatform(url: string | URL): Platform {
  let hostname: string;
  try {
    hostname = (typeof url === 'string' ? new URL(url) : url).hostname.toLowerCase();
  } catch {
    return OTHER;
  }
  return PLATFORMS.find((p) => p.hosts.some((h) => hostMatches(hostname, h))) ?? OTHER;
}

/**
 * Pulls the first link out of whatever the user pasted or shared
 * ("Check this out! https://..."), adding https:// to bare domains.
 */
export function findUrl(text: string): string | null {
  const trimmed = text.trim();
  const explicit = trimmed.match(/https?:\/\/[^\s<>"']+/i);
  const candidate = explicit?.[0] ?? trimmed.match(/(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"']*/i)?.[0];
  if (!candidate) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
    return url.toString();
  } catch {
    return null;
  }
}
