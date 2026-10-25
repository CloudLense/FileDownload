// Streams downloads at the edge. Netlify Functions buffer responses (6 MB cap
// on the free plan), which is what broke the old /api/download; edge functions
// stream with no size limit and are included in the free plan.
import { proxyDownload } from '../../src/lib/ticket.ts';

declare const Netlify: { env: { get(name: string): string | undefined } };

export default function handler(request: Request) {
  return proxyDownload(request, Netlify.env.get('DOWNLOAD_SECRET') ?? '');
}

export const config = { path: '/dl' };
