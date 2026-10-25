import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Help · dwnld.in',
  description: 'How to download videos and photos from Instagram, TikTok, X, LinkedIn and YouTube with dwnld.in.',
};

const TOPICS = [
  {
    q: 'How do I download something?',
    a: 'In the app, tap Share → Copy link on the post. Paste it on dwnld.in and tap Download. Every photo and video in the post shows up; tap Save on the ones you want.',
  },
  {
    q: 'Which links work?',
    a: 'Public posts from Instagram (reels, posts, carousels), TikTok (videos and photo posts, without watermark), X / Twitter, LinkedIn and YouTube, plus Facebook, Reddit and Pinterest.',
  },
  {
    q: 'How do I save to Photos on iPhone?',
    a: 'The quickest way is the dwnld Shortcut: tap Share → dwnld in any app. In Safari, tap Save, then open the download (the arrow in the address bar), tap Share and choose Save Video or Save Image.',
  },
  {
    q: 'The download didn’t work.',
    a: 'Private accounts, age-restricted videos, stories that have expired and deleted posts can’t be downloaded. If the post is public, wait a minute and try again; platforms sometimes limit how often we can ask.',
  },
  {
    q: 'Do you keep my files or links?',
    a: 'No. Files stream from the platform straight to your device and aren’t stored. Your recent links are saved only in your own browser, and you can clear them from the home page.',
  },
];

export default function Help() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-8">
        <h1 className="pt-8 font-display text-5xl font-bold tracking-tight text-ink [font-stretch:85%] sm:pt-14 sm:text-6xl">Help</h1>
        <div className="mt-10 max-w-3xl border-b border-line">
          {TOPICS.map((t) => (
            <section key={t.q} className="border-t border-line py-6">
              <h2 className="text-lg font-semibold text-ink">{t.q}</h2>
              <p className="mt-2 max-w-prose leading-relaxed text-muted">{t.a}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 text-muted">
          Still stuck? Email{' '}
          <a href="mailto:support@dwnld.in" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
            support@dwnld.in
          </a>{' '}
          with the link you tried, or read our <Link href="/privacy" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">privacy policy</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
