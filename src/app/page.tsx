import { Suspense } from 'react';
import Downloader from '@/components/Downloader';
import ShareSheetDemo from '@/components/ShareSheetDemo';
import { SiteFooter, SiteHeader } from '@/components/SiteShell';
import Wordmark from '@/components/Wordmark';

const STEPS = [
  { title: 'Copy the link', body: 'Share → Copy link, on any reel, post, video or tweet.' },
  { title: 'Paste it above', body: 'We find every photo and video in the post, at the best quality on offer.' },
  { title: 'Save', body: 'Straight to your device. TikToks come without the watermark.' },
];

const FAQ = [
  {
    q: 'Which sites work?',
    a: 'Instagram reels, posts and carousels; TikTok videos and photo posts; X / Twitter; LinkedIn; YouTube; plus Facebook, Reddit and Pinterest. The post has to be public.',
  },
  {
    q: 'Do I need an account or an app?',
    a: 'No. It’s free and runs in your browser. We don’t store your files or the links you paste; your recent links stay in your own browser.',
  },
  {
    q: 'How do I get videos into my iPhone’s Photos?',
    a: 'Add the dwnld Shortcut once, then tap Share → dwnld in any app. Without it: tap Save here, open the download in Safari and choose Save Video.',
  },
  {
    q: 'Is there a faster way than copy and paste?',
    a: 'Type dwnld.in/ in front of any link in your address bar, for example dwnld.in/x.com/nasa/status/…, and the download starts right away.',
  },
  {
    q: 'A link didn’t work. What now?',
    a: 'Private accounts, age-restricted videos and deleted posts can’t be downloaded. If the post is public, wait a minute and try again, or write to support@dwnld.in with the link.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-8">
        <section className="pt-6 sm:pt-12">
          <h1 className="sr-only">dwnld: download videos and photos from any link</h1>
          <Wordmark />
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
            Paste a link from Instagram, TikTok, X, LinkedIn or YouTube and keep the video or photo. No app, no sign-up, no watermark.
          </p>
          <div className="mt-8 max-w-3xl">
            <Suspense>
              <Downloader />
            </Suspense>
          </div>
        </section>

        <section className="mt-28" aria-labelledby="how-title">
          <h2 id="how-title" className="sr-only">
            How it works
          </h2>
          <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-ink pt-4">
                <span className="font-display text-5xl font-extrabold leading-none text-accent [font-stretch:75%]">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <ShareSheetDemo />

        <section className="mt-16 grid gap-8 md:grid-cols-[1fr_2fr]" aria-labelledby="faq-title">
          <h2 id="faq-title" className="font-display text-4xl font-bold tracking-tight text-ink [font-stretch:85%]">
            Questions
          </h2>
          <div className="border-b border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-t border-line py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-ink">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform duration-500 [transition-timing-function:var(--spring)] group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
