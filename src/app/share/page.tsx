import { redirect } from 'next/navigation';
import { findUrl } from '@/lib/platforms';

// Android share target (see manifest.ts). Apps put the link in `url`, `text`
// or even `title` ("Check this out https://…"), so look in all three, then
// hand off to the home page with auto=1 to start the download right away.
export default async function Share({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const fields = ['url', 'text', 'title'].map((k) => {
    const v = params[k];
    return Array.isArray(v) ? v.join(' ') : (v ?? '');
  });
  const link = fields.map(findUrl).find(Boolean);

  // No link: pass the text along so the page explains what it got.
  const query = link ? `url=${encodeURIComponent(link)}&auto=1` : `text=${encodeURIComponent(fields.filter(Boolean).join(' ').slice(0, 300))}`;
  redirect(`/?${query}`);
}
