import { notFound, redirect } from 'next/navigation';

// Lets people type "dwnld.in/" in front of any link:
//   dwnld.in/https://www.instagram.com/reel/xyz → /?url=https://www.instagram.com/reel/xyz
export default async function PrefixedLink({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const segments = slug.map(decodeURIComponent).filter(Boolean);
  if (/^https?:$/i.test(segments[0] ?? '')) segments.shift();
  if (!segments[0]?.includes('.')) notFound();

  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams)) {
    for (const value of Array.isArray(v) ? v : v ? [v] : []) query.append(k, value);
  }
  const qs = query.toString();
  redirect(`/?url=${encodeURIComponent(`https://${segments.join('/')}${qs ? `?${qs}` : ''}`)}`);
}
