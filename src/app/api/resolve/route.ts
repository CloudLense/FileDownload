import { NextResponse } from 'next/server';
import { ExtractError, extract, type ExtractResult } from '@/lib/extract';
import { findUrl } from '@/lib/platforms';
import { downloadSecret } from '@/lib/secret';
import { signTicket } from '@/lib/ticket';

export const dynamic = 'force-dynamic';

export interface ResolvedItem {
  type: ExtractResult['items'][number]['type'];
  filename: string;
  label?: string;
  size?: number;
  thumbnail?: string;
  /** same-origin, forces a "save file" download */
  download: string;
  /** straight CDN link (used by the iOS Shortcut to skip the proxy) */
  direct: string;
}

export interface ResolveResponse extends Omit<ExtractResult, 'items'> {
  source: string;
  items: ResolvedItem[];
}

async function resolve(input: string | null, origin: string): Promise<ResolveResponse> {
  const source = input ? findUrl(input) : null;
  if (!source) throw new ExtractError('Paste a link to a post or video.', 400);

  const secret = downloadSecret();
  if (!secret) throw new ExtractError('Downloads are not configured on this server.', 500);

  const result = await extract(source);
  const items = await Promise.all(
    result.items.map(async ({ url, headers, ...item }) => {
      const ticket = await signTicket({ u: url, f: item.filename, ...(headers && { h: headers }) }, secret);
      return {
        ...item,
        download: `${origin}/dl?t=${ticket}`,
        direct: headers ? `${origin}/dl?t=${ticket}` : url,
      };
    }),
  );
  return { ...result, source, items };
}

function errorInfo(err: unknown): { message: string; status: number } {
  if (err instanceof ExtractError) return { message: err.message, status: err.status };
  console.error('[resolve] unexpected error', err);
  return { message: 'Something went wrong. Please try again.', status: 500 };
}

/**
 * GET /api/resolve?url=<link>                → JSON for the web app
 * GET /api/resolve?url=<link>&format=shortcut → flat JSON for the iOS Shortcut
 *   (always HTTP 200 so Shortcuts can read the "error" key)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const shortcut = searchParams.get('format') === 'shortcut';

  try {
    const data = await resolve(searchParams.get('url'), origin);
    if (shortcut) {
      return NextResponse.json({
        title: data.title ?? '',
        count: data.items.length,
        // Shortcuts' "Save to Photo Album" can't take audio, so only send visual media.
        urls: data.items.filter((i) => i.type !== 'audio').map((i) => i.direct),
      });
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    const { message, status } = errorInfo(err);
    return NextResponse.json({ error: message }, { status: shortcut ? 200 : status });
  }
}
