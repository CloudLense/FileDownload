import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/SiteShell';
import { SHORTCUT_ICLOUD_URL, SHORTCUT_UPDATED, SHORTCUT_VERSION } from '@/lib/shortcut';

export const metadata: Metadata = {
  title: 'iPhone Shortcut · dwnld.in',
  description: 'Download Instagram, TikTok, X and LinkedIn videos straight to Photos from the iOS share sheet.',
};

// An iCloud link opens the native "Add Shortcut" sheet in one tap. Without
// one we can only offer the signed file, which browsers download instead.
const ICLOUD_URL = SHORTCUT_ICLOUD_URL;
const UPDATED = new Date(`${SHORTCUT_UPDATED}T00:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const USE_STEPS = [
  'Open a post in Instagram, TikTok, X, LinkedIn or YouTube.',
  'Tap Share, then pick dwnld (scroll down or tap “Edit Actions…” to pin it near the top).',
  'In apps that only offer “Copy link”, copy it and run dwnld from your home screen or widget instead; it reads the clipboard.',
  'Done. The video or photos are in your Photos app.',
  'When a new version is out, dwnld tells you after a download and brings you back here to add it.',
];

const BUILD_STEPS = [
  ['Receive', 'URLs and Text from Share Sheet. If there’s no input: Get Clipboard.'],
  ['Get URLs from', 'Shortcut Input'],
  ['Get First Item from', 'URLs'],
  ['URL Encode', 'Item from List'],
  ['Get Contents of', 'https://dwnld.in/api/resolve?format=shortcut&url=[URL Encoded Text]'],
  ['Get Value for', '“error” in Contents of URL → If it has any value: Show Alert (Dictionary Value), Stop This Shortcut. End If'],
  ['Get Value for', '“urls” in Contents of URL'],
  ['Repeat with Each', 'item in Dictionary Value → Get Contents of [Repeat Item] → Save to Photo Album. End Repeat'],
  ['Show Notification', '“Saved to Photos ✓”'],
];

export default function ShortcutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6">
        <section className="pt-8 sm:pt-14">
          <p className="font-medium text-accent">For iPhone and iPad</p>
          <h1 className="mt-2 text-balance font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink [font-stretch:85%] sm:text-6xl">
            Share → dwnld → saved to Photos.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            A free Shortcut for the iOS share sheet. No app to install, no ads, no account. It sends the link to dwnld.in and saves what comes back
            straight to your camera roll.
          </p>
          {ICLOUD_URL ? (
            <>
              <a
                href={ICLOUD_URL}
                className="press mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-accent px-7 py-4 text-lg font-semibold text-accent-ink hover:brightness-105 sm:w-auto"
              >
                Add to Shortcuts
              </a>
              <p className="mt-3 text-sm text-muted">
                Version {SHORTCUT_VERSION}, updated {UPDATED}. Opens the Shortcuts app; tap Add Shortcut. The first time it runs, iOS asks to allow dwnld.in and Photos access; choose Always
                Allow.
              </p>
            </>
          ) : (
            <>
              <a
                href="/dwnld.shortcut"
                className="press mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-accent px-7 py-4 text-lg font-semibold text-accent-ink hover:brightness-105 sm:w-auto"
              >
                Download the Shortcut
              </a>
              <p className="mt-3 text-sm text-muted">
                After it downloads, open the Files app, tap dwnld.shortcut in Downloads, then tap Add Shortcut. Or build it yourself in two
                minutes with the steps below.
              </p>
            </>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink [font-stretch:85%]">How to use it</h2>
          <ol className="mt-4 grid gap-3">
            {USE_STEPS.map((step, i) => (
              <li key={step} className="flex gap-4 rounded-3xl border border-line bg-surface p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-ink">{i + 1}</span>
                <p className="pt-1 text-[15px] leading-relaxed text-ink">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink [font-stretch:85%]">Prefer to build it yourself?</h2>
          <p className="mt-2 text-muted">
            It takes about two minutes in the Shortcuts app. Create a new Shortcut, turn on “Show in Share Sheet” in its details, and add these
            actions in order:
          </p>
          <ol className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {BUILD_STEPS.map(([name, detail], i) => (
              <li key={i} className="flex gap-3 p-4 text-[15px]">
                <span className="w-5 shrink-0 text-right font-mono text-muted">{i + 1}</span>
                <p className="min-w-0 break-words">
                  <span className="font-semibold text-ink">{name}</span> <span className="text-muted">{detail}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-semibold text-ink">For developers</h2>
          <p className="mt-1 text-[15px] text-muted">
            <span className="font-mono text-[13px] text-ink">GET /api/resolve?url=…</span> returns every photo and video in a post as JSON. Add{' '}
            <span className="font-mono text-[13px] text-ink">&amp;format=shortcut</span> for a flat{' '}
            <span className="font-mono text-[13px] text-ink">{'{ urls: [...] }'}</span> list, or{' '}
            <span className="font-mono text-[13px] text-ink">{'{ error }'}</span> when something goes wrong.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
