import Link from 'next/link';

// A scroll-scrubbed demo of the iOS Shortcut: post → share sheet → dwnld → saved.
// Pure CSS (scroll-driven animations); browsers without them show the end state.

const CAPTIONS = [
  { title: 'Tap Share on any post', body: 'Instagram, TikTok, X, LinkedIn, YouTube or Safari.' },
  { title: 'Pick dwnld', body: 'It sits in your share sheet next to Messages and Mail.' },
  { title: 'It’s in Photos', body: 'No app to open, no ads, nothing to sign in to.' },
];

const APPS = [
  { name: 'AirDrop', hue: 'bg-[#cfd5ea]' },
  { name: 'Messages', hue: 'bg-[#cfe8d6]' },
  { name: 'dwnld', hue: '' },
  { name: 'Mail', hue: 'bg-[#d5e2f5]' },
];

export default function ShareSheetDemo() {
  return (
    <section className="demo relative mt-28" aria-labelledby="demo-title">
      <div className="demo-track h-[260vh]">
        <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 py-10 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-sm">
            <h2 id="demo-title" className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink [font-stretch:85%] sm:text-5xl">
              On iPhone, skip the website.
            </h2>
            <ol className="mt-6 hidden space-y-5 md:block">
              {CAPTIONS.map((c, i) => (
                <li key={c.title} className={`caption caption-${i + 1}`}>
                  <p className="font-semibold text-ink">{c.title}</p>
                  <p className="text-[15px] text-muted">{c.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/shortcut"
                className="press inline-flex items-center rounded-full bg-ink px-6 py-3 font-semibold text-bg hover:opacity-90"
              >
                Get the Shortcut
              </Link>
              <Link href="/android" className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                On Android? Install dwnld
              </Link>
            </div>
          </div>

          <Phone />

          <ol className="grid grid-cols-3 gap-3 text-sm md:hidden">
            {CAPTIONS.map((c, i) => (
              <li key={c.title} className={`caption caption-${i + 1} font-medium leading-snug text-ink`}>
                {c.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Phone() {
  return (
    <div
      className="relative mx-auto aspect-[9/19] h-[min(62svh,560px)] shrink-0 overflow-hidden rounded-[2.6rem] border-[6px] border-ink bg-[#101024] shadow-[0_40px_80px_-40px_rgba(22,19,61,0.6)] md:mx-0"
      aria-hidden
    >
      {/* the post */}
      <div className="post absolute inset-0 flex flex-col">
        <div className="flex items-center gap-2 px-4 pb-3 pt-9">
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-[#ffb36b] to-[#ff5e8a]" />
          <span className="text-[11px] font-semibold text-white">studio.lumen</span>
        </div>
        <div className="relative flex-1 overflow-hidden bg-[radial-gradient(120%_80%_at_30%_20%,#ffb36b_0%,#ff5e8a_35%,#6a4bff_70%,#141336_100%)]">
          <div className="absolute inset-x-6 bottom-8 h-24 rounded-[50%] bg-[#141336]/40 blur-2xl" />
          <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 backdrop-blur">
            <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-white" />
          </span>
        </div>
        <div className="flex justify-between px-5 py-4 text-white/80">
          <span className="h-4 w-4 rounded-full border-2 border-current" />
          <span className="h-4 w-4 rounded-full border-2 border-current" />
          <span className="h-4 w-4 rotate-45 border-r-2 border-t-2 border-current" />
        </div>
      </div>

      {/* share sheet */}
      <div className="sheet absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#f2f2f7] px-3 pb-6 pt-2 text-[#1c1c1e]">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/20" />
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-white p-2">
          <span className="h-9 w-9 rounded-lg bg-[radial-gradient(circle_at_30%_20%,#ffb36b,#ff5e8a_50%,#6a4bff)]" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold">Reel by studio.lumen</p>
            <p className="truncate text-[10px] text-black/50">instagram.com</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {APPS.map((app) => (
            <div key={app.name} className="flex flex-col items-center gap-1">
              {app.name === 'dwnld' ? (
                <span className="relative">
                  <span className="tap-ring absolute -inset-1.5 rounded-[18px] border-2 border-[#4733ff]" />
                  <span className="tap-icon grid h-11 w-11 place-items-center rounded-[13px] bg-[#4733ff] text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
                    </svg>
                  </span>
                </span>
              ) : (
                <span className={`h-11 w-11 rounded-[13px] ${app.hue}`} />
              )}
              <span className="text-[9px]">{app.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-px overflow-hidden rounded-xl bg-white text-[11px]">
          <p className="px-3 py-2">Copy Link</p>
          <p className="border-t border-black/5 px-3 py-2">Add to Reading List</p>
        </div>
      </div>

      {/* confirmation */}
      <div className="toast absolute inset-x-3 top-3 flex items-center gap-2 rounded-2xl bg-white/90 p-2.5 text-[#1c1c1e] shadow-lg backdrop-blur">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#1fbf8a] text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-semibold">dwnld</p>
          <p className="text-[10px] text-black/60">Saved to Photos</p>
        </div>
      </div>
    </div>
  );
}
