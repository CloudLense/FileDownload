import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-accent text-accent-ink">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
          </svg>
        </span>
        dwnld.in
      </Link>
      <nav className="flex items-center gap-1 text-[15px]">
        <Link href="/shortcut" className="rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink">
          iPhone
        </Link>
        <Link href="/android" className="rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink">
          Android
        </Link>
        <Link href="/help" className="rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink">
          Help
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-5xl px-4 pb-10 text-sm text-muted sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-6">
        <p className="max-w-xs">Download only what you own or have permission to save.</p>
        <nav className="flex gap-5">
          <Link href="/help" className="hover:text-ink">Help</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
