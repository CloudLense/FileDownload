'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Chrome's install prompt event (not in TypeScript's DOM types yet).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Status = 'unknown' | 'ready' | 'installed' | 'ios' | 'manual';

/** One-tap install where Chrome offers it; otherwise says what to do instead. */
export default function InstallButton() {
  const [status, setStatus] = useState<Status>('unknown');
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setStatus('ready');
    };
    const onInstalled = () => setStatus('installed');
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // If Chrome hasn't offered the prompt shortly after load, show the manual steps.
    const id = setTimeout(() => {
      setStatus((s) => {
        if (s !== 'unknown') return s;
        if (matchMedia('(display-mode: standalone)').matches) return 'installed';
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return 'ios';
        return 'manual';
      });
    }, 1200);

    return () => {
      clearTimeout(id);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    setStatus(outcome === 'accepted' ? 'installed' : 'manual');
  };

  const button =
    'press mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-accent px-7 py-4 text-lg font-semibold text-accent-ink hover:brightness-105 sm:w-auto';

  if (status === 'ready') {
    return (
      <button onClick={install} className={button}>
        Install dwnld
      </button>
    );
  }
  if (status === 'installed') {
    return (
      <p className="mt-8 rounded-2xl border border-line bg-surface p-4 font-medium text-ink">
        dwnld is installed. Share any post and pick dwnld from the list.
      </p>
    );
  }
  if (status === 'ios') {
    return (
      <Link href="/shortcut" className={button}>
        On iPhone? Get the Shortcut
      </Link>
    );
  }
  // 'unknown' renders the same as 'manual' to avoid a layout jump.
  return (
    <p className="mt-8 rounded-2xl border border-line bg-surface p-4 text-[15px] text-ink">
      Open <span className="font-semibold">dwnld.in</span> in Chrome, tap <span className="font-semibold">⋮</span>, then{' '}
      <span className="font-semibold">Install app</span> (or <span className="font-semibold">Add to Home screen</span>).
    </p>
  );
}
