// Signed download tickets + the streaming proxy behind /dl.
//
// This file is imported by both the Next.js route (Node) and the Netlify Edge
// Function (Deno), so it must only use Web-standard APIs and have no imports.

export interface DownloadTicket {
  /** upstream media URL */
  u: string;
  /** filename to save as */
  f: string;
  /** expiry, unix seconds */
  e: number;
  /** extra upstream request headers, if the CDN needs them */
  h?: Record<string, string>;
}

const TICKET_TTL_SECONDS = 60 * 60 * 6;
const UPSTREAM_UA = 'Mozilla/5.0 (compatible; dwnld.in/2.0; +https://dwnld.in)';
const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signTicket(
  ticket: Omit<DownloadTicket, 'e'>,
  secret: string,
): Promise<string> {
  const payload = toBase64Url(
    enc.encode(JSON.stringify({ ...ticket, e: Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS })),
  );
  return `${payload}.${toBase64Url(await hmac(secret, payload))}`;
}

export async function verifyTicket(token: string, secret: string): Promise<DownloadTicket | null> {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  try {
    if (!timingSafeEqual(fromBase64Url(sig), await hmac(secret, payload))) return null;
    const ticket = JSON.parse(dec.decode(fromBase64Url(payload))) as DownloadTicket;
    if (typeof ticket.u !== 'string' || ticket.e < Date.now() / 1000) return null;
    return ticket;
  } catch {
    return null;
  }
}

function contentDisposition(filename: string, inline: boolean): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '');
  return `${inline ? 'inline' : 'attachment'}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function textResponse(message: string, status: number): Response {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

/**
 * Handles GET /dl?t=<ticket>[&inline=1]. Streams the upstream file straight
 * through (never buffers it), forwarding Range so iOS/Safari video works.
 */
export async function proxyDownload(request: Request, secret: string): Promise<Response> {
  if (!secret) return textResponse('Download proxy is not configured (DOWNLOAD_SECRET).', 500);

  const params = new URL(request.url).searchParams;
  const ticket = await verifyTicket(params.get('t') ?? '', secret);
  if (!ticket) return textResponse('This download link is invalid or has expired. Paste the post link again.', 403);

  const upstreamHeaders: Record<string, string> = { 'User-Agent': UPSTREAM_UA, ...ticket.h };
  const range = request.headers.get('range');
  if (range) upstreamHeaders['Range'] = range;

  let upstream: Response;
  try {
    upstream = await fetch(ticket.u, { headers: upstreamHeaders, redirect: 'follow' });
  } catch {
    return textResponse('Could not reach the media server. Please try again.', 502);
  }
  if (!upstream.ok && upstream.status !== 206) {
    return textResponse(`The media server refused the download (${upstream.status}). Try pasting the link again.`, 502);
  }

  const headers = new Headers({
    'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
    'Content-Disposition': contentDisposition(ticket.f, params.get('inline') === '1'),
    'Cache-Control': 'private, max-age=3600',
    'Accept-Ranges': upstream.headers.get('accept-ranges') ?? 'bytes',
  });
  for (const h of ['content-length', 'content-range', 'last-modified', 'etag']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
