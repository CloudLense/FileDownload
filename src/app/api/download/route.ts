import { NextResponse } from 'next/server';
import { GET as resolve } from '../resolve/route';

// Legacy endpoint kept for old links/integrations: resolves the post and
// redirects to the first downloadable file.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const res = await resolve(request);
  const data = await res.json();
  if (!res.ok || !data.items?.length) {
    return NextResponse.json({ error: data.error ?? 'No downloadable media found' }, { status: res.ok ? 404 : res.status });
  }
  return NextResponse.redirect(data.items[0].download, 302);
}
