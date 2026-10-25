import { NextResponse } from 'next/server';
import { ExtractError, extract, type ExtractResult } from '@/lib/extract';
import { findUrl } from '@/lib/platforms';
import { downloadSecret } from '@/lib/secret';
import { shortcutUpdateNotice } from '@/lib/shortcut';
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
  /** straight CDN link, for API consumers that want to skip the proxy */
  direct: string;
}

export interface ResolveResponse extends Omit<ExtractResult, 'items'> {
  source: string;
  items: ResolvedItem[];
}

/**
 * Undoes extra rounds of percent-encoding. iOS Shortcuts encodes a variable
 * inserted into "Get Contents of URL" on top of our own "URL Encode" step, so
 * the link can arrive as https%3A%2F%2F… after the usual single decode.
 */
function decodeLink(input: string): string {
  let value = input.trim();
  for (let i = 0; i < 3 && /%[0-9a-f]{2}/i.test(value) && !/^https?:\/\//i.test(value); i++) {
    try {
      value = decodeURIComponent(value);
    } catch {
      break;
    }
  }
  return value;
}

async function resolve(input: string | null, origin: string): Promise<ResolveResponse> {
  const raw = input ? decodeLink(input) : '';
  const source = raw ? findUrl(raw) : null;
  if (!source) {
    throw new ExtractError(
      raw
        ? `No link found in “${raw.slice(0, 80)}”. Share or paste a link to a post or video.`
        : 'No link received. In the app, tap Share → Copy link, then run dwnld from your home screen; it reads the clipboard.',
      400,
    );
  }

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

/**
 * The public origin the request came in on. On Netlify, request.url carries
 * the internal deploy host (main--<site>.netlify.app); the host the visitor
 * used is in x-forwarded-host.
 */
function publicOrigin(request: Request): string {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
  if (!host) return new URL(request.url).origin;
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || 'https';
  return `${proto}://${host}`;
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
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
  const shortcut = searchParams.get('format') === 'shortcut';
  // Shortcuts send their version as &v=N; v1 predates versioning and sends none.
  const update = shortcut ? shortcutUpdateNotice(Number(searchParams.get('v')) || 1) : null;

  // What the app put in the share sheet (Shortcut v4+), to explain failures.
  const sharedAs = shortcut ? searchParams.get('type')?.trim().slice(0, 40) : undefined;

  try {
    const data = await resolve(searchParams.get('url'), origin);
    if (shortcut) {
      return NextResponse.json({
        title: data.title ?? '',
        count: data.items.length,
        // Shortcuts' "Save to Photo Album" can't take audio, so only send visual media.
        // Proxied through /dl so iOS asks for network access once (dwnld.in), not
        // once per CDN host; TikTok alone rotates through many hostnames.
        urls: data.items.filter((i) => i.type !== 'audio').map((i) => i.download),
        ...(update && { update }),
      });
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    const { message, status } = errorInfo(err);
    const error = sharedAs ? `${message} (The app shared: ${sharedAs}.)` : message;
    return NextResponse.json({ error, ...(update && { update }) }, { status: shortcut ? 200 : status });
  }
}
