import type { Metadata } from 'next';
import InstallButton from '@/components/InstallButton';
import { SiteFooter, SiteHeader } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Android · dwnld.in',
  description: 'Install dwnld.in on Android and download videos straight from the share sheet.',
};

const STEPS = [
  'Install dwnld from the top of this page. It’s the website, added to your phone; there’s nothing to download from the Play Store.',
  'Open a post in Instagram, TikTok, X, LinkedIn or YouTube and tap Share.',
  'Pick dwnld. If you don’t see it, scroll the app row or tap More.',
  'The download starts by itself. Find it in Files → Downloads; Google Photos and Gallery show videos from there too.',
];

export default function AndroidPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6">
        <section className="pt-8 sm:pt-14">
          <p className="font-medium text-accent">For Android</p>
          <h1 className="mt-2 text-balance font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink [font-stretch:85%] sm:text-6xl">
            Share → dwnld → downloaded.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Install dwnld.in once and it shows up in your share sheet next to your other apps. Share a post to it and the video starts
            downloading. No Play Store app, no ads, no account.
          </p>
          <InstallButton />
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink [font-stretch:85%]">How to use it</h2>
          <ol className="mt-4 grid gap-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-4 rounded-3xl border border-line bg-surface p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-ink">{i + 1}</span>
                <p className="pt-1 text-[15px] leading-relaxed text-ink">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Posts with several photos or videos</h2>
          <p className="mt-1 text-[15px] text-muted">
            dwnld opens with every item listed. Tap Save on the ones you want, or Save all.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
