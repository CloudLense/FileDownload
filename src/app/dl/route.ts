import { downloadSecret } from '@/lib/secret';
import { proxyDownload } from '@/lib/ticket';

// On Netlify, netlify/edge-functions/dl.ts serves /dl instead (no response
// size cap there). This route is the fallback for `next dev` and other hosts.
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return proxyDownload(request, downloadSecret());
}
