'use client';

/* eslint-disable @next/next/no-img-element -- remote CDN thumbnails, not worth optimizing */

import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ResolveResponse, ResolvedItem } from '@/app/api/resolve/route';
import { detectPlatform, findUrl, PLATFORMS } from '@/lib/platforms';

type State =
  | { status: 'idle' }
  | { status: 'loading'; source: string }
  | { status: 'done'; data: ResolveResponse; autoSave: boolean }
  | { status: 'error'; message: string; source: string };

interface RecentEntry {
  source: string;
  title?: string;
  thumbnail?: string;
  platform: string;
  at: number;
}

const RECENT_KEY = 'dwnld:recent';
const STAGES = ['Finding the post', 'Getting the files', 'Almost there'];

function loadRecent(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecent(entries: RecentEntry[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(entries));
  } catch {
    // private mode / storage blocked: history is a nicety
  }
}

function formatBytes(bytes?: number): string | null {
  if (!bytes) return null;
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} KB`;
}

/** Animates a state change with the View Transitions API where available. */
function transition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

const TYPE_LABEL: Record<ResolvedItem['type'], string> = {
  video: 'Video',
  photo: 'Photo',
  gif: 'GIF',
  audio: 'Sound',
};

const FEATURED = PLATFORMS.filter((p) => p.featured);

export default function Downloader() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });
  const [stage, setStage] = useState(0);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [canPaste, setCanPaste] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const autoRan = useRef(false);

  const detectedUrl = findUrl(input);
  const detected = detectedUrl ? detectPlatform(detectedUrl) : null;

  const resolve = useCallback(async (raw: string, { autoSave = false } = {}) => {
    const source = findUrl(raw);
    if (!source) {
      transition(() =>
        setState({ status: 'error', message: 'That isn’t a link. Copy the post’s link (Share → Copy link) and paste it here.', source: raw }),
      );
      return;
    }
    setInput(source);
    setStage(0);
    transition(() => setState({ status: 'loading', source }));
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));

    try {
      const res = await fetch(`/api/resolve?url=${encodeURIComponent(source)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong on our side. Try again in a moment.');
      transition(() => setState({ status: 'done', data, autoSave }));

      const entry: RecentEntry = { source, title: data.title, thumbnail: data.thumbnail, platform: data.platform, at: Date.now() };
      const next = [entry, ...loadRecent().filter((r) => r.source !== source)].slice(0, 8);
      saveRecent(next);
      setRecent(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong on our side. Try again in a moment.';
      transition(() => setState({ status: 'error', message, source }));
    }
  }, []);

  // Browser-only state, plus ?url=… (links, the dwnld.in/<link> trick) and
  // ?text=… (Android share target). Deferred so the first render matches SSR.
  useEffect(() => {
    const id = setTimeout(() => {
      setRecent(loadRecent());
      setCanPaste(!!navigator.clipboard?.readText);
      if (autoRan.current) return;
      const shared = searchParams.get('url') ?? searchParams.get('text') ?? searchParams.get('title');
      if (shared) {
        autoRan.current = true;
        // auto=1 comes from the Android share target (/share): save right away.
        const autoSave = searchParams.get('auto') === '1';
        if (autoSave) history.replaceState(null, '', `/?url=${encodeURIComponent(shared)}`);
        resolve(shared, { autoSave });
      }
    }, 0);
    return () => clearTimeout(id);
  }, [searchParams, resolve]);

  // Step the button's status text while we wait.
  useEffect(() => {
    if (state.status !== 'loading') return;
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1600);
    return () => clearInterval(id);
  }, [state.status]);

  const onPasteButton = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) resolve(text);
    } catch {
      // permission denied: the user can still paste by hand
    }
  };

  const onPasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (findUrl(text) && !input) {
      e.preventDefault();
      resolve(text);
    }
  };

  const reset = () => {
    transition(() => setState({ status: 'idle' }));
    setInput('');
  };

  const loading = state.status === 'loading';

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          resolve(input);
        }}
        className="catch"
      >
        <label htmlFor="link" className="sr-only">
          Link to a post or video
        </label>
        <div className="field flex flex-col gap-2 rounded-[1.75rem] p-2 sm:flex-row sm:items-center">
          <div className="relative flex min-w-0 flex-1 items-center">
            <input
              id="link"
              type="url"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={onPasteEvent}
              placeholder="Paste a link"
              className="h-14 w-full min-w-0 bg-transparent pl-4 pr-24 text-lg text-ink placeholder:text-muted focus:outline-none"
            />
            {input ? (
              <button type="button" onClick={reset} className="press absolute right-1 rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink">
                Clear
              </button>
            ) : (
              canPaste && (
                <button
                  type="button"
                  onClick={onPasteButton}
                  className="press absolute right-1 flex items-center gap-1.5 rounded-full bg-surface-2 px-3.5 py-2 text-sm font-medium text-ink"
                >
                  <ClipboardIcon />
                  Paste
                </button>
              )
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="press relative flex h-14 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[1.3rem] bg-accent px-7 text-lg font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[13.5rem]"
          >
            {loading ? <Spinner /> : <DownloadIcon />}
            <span key={loading ? `s${stage}` : 'idle'} className="roll">
              {loading ? STAGES[stage] : 'Download'}
            </span>
          </button>
        </div>
      </form>

      <p className="mt-4 px-1 text-[15px] text-muted">
        Works with{' '}
        {FEATURED.map((p, i) => (
          <span key={p.id}>
            <span
              className={`transition-colors duration-300 ${detected?.id === p.id ? 'font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4' : ''}`}
            >
              {p.name}
            </span>
            {i < FEATURED.length - 2 ? ', ' : i === FEATURED.length - 2 ? ' and ' : ''}
          </span>
        ))}
        .
      </p>

      <div ref={resultRef} className="mt-8 scroll-mt-6 [view-transition-name:result]" aria-live="polite">
        {state.status === 'loading' && <LoadingCard />}
        {state.status === 'error' && (
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="font-semibold text-ink">No media found for this link</p>
              <p className="mt-1 max-w-lg text-[15px] text-muted">{state.message}</p>
            </div>
            <button
              onClick={() => resolve(state.source)}
              className="press shrink-0 rounded-full border border-line px-5 py-2.5 font-medium text-ink hover:border-ink"
            >
              Try again
            </button>
          </div>
        )}
        {state.status === 'done' && <Result data={state.data} autoSave={state.autoSave} onReset={reset} />}
      </div>

      {state.status === 'idle' && recent.length > 0 && (
        <section className="mt-2" aria-labelledby="recent-title">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 id="recent-title" className="font-semibold text-ink">
              Recent
            </h2>
            <button
              onClick={() => {
                saveRecent([]);
                setRecent([]);
              }}
              className="text-sm text-muted hover:text-ink"
            >
              Clear history
            </button>
          </div>
          <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {recent.map((r) => (
              <li key={r.source} className="w-32 shrink-0 snap-start">
                <button onClick={() => resolve(r.source)} className="press group block w-full text-left">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
                    {r.thumbnail && (
                      <img
                        src={r.thumbnail}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink">{r.title || r.source}</p>
                  <p className="text-xs text-muted">{detectPlatform(r.source).name}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Result({ data, autoSave, onReset }: { data: ResolveResponse; autoSave: boolean; onReset: () => void }) {
  const platform = detectPlatform(data.source);
  const visual = data.items.filter((i) => i.type !== 'audio');
  const audio = data.items.filter((i) => i.type === 'audio');

  const saveAll = async () => {
    for (const item of visual) {
      const a = document.createElement('a');
      a.href = item.download;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      await new Promise((r) => setTimeout(r, 700));
    }
  };

  return (
    <div className="rounded-[1.75rem] border border-line bg-surface p-3 sm:p-4">
      <div className="flex items-start gap-3 px-2 pb-4 pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">
            {platform.name}
            {data.author ? `, ${data.author}` : ''}
          </p>
          {data.title && <p className="mt-0.5 line-clamp-2 text-[15px] leading-snug text-ink">{data.title}</p>}
        </div>
        <button onClick={onReset} className="press shrink-0 rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink">
          New link
        </button>
      </div>

      <ul className={`grid gap-3 ${visual.length > 1 ? 'grid-cols-2 lg:grid-cols-3' : ''}`}>
        {visual.map((item, i) => (
          <MediaTile
            key={item.download}
            item={item}
            fallbackThumb={data.thumbnail}
            index={i}
            single={visual.length === 1}
            autoSave={autoSave && visual.length === 1}
          />
        ))}
      </ul>

      {(audio.length > 0 || visual.length > 1) && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {visual.length > 1 && (
            <button onClick={saveAll} className="press flex-1 rounded-2xl bg-accent py-3.5 font-semibold text-accent-ink">
              Save all {visual.length}
            </button>
          )}
          {audio.map((item) => (
            <SaveButton key={item.download} item={item} className="flex-1 justify-center rounded-2xl border border-line py-3.5 text-ink">
              Save sound only
            </SaveButton>
          ))}
        </div>
      )}

      <p className="px-2 pb-1 pt-4 text-[13px] text-muted">
        On iPhone, open the download and choose Save Video, or{' '}
        <Link href="/shortcut" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          add the Shortcut
        </Link>{' '}
        to save to Photos in one tap.
      </p>
    </div>
  );
}

function MediaTile({
  item,
  fallbackThumb,
  index,
  single,
  autoSave,
}: {
  item: ResolvedItem;
  fallbackThumb?: string;
  index: number;
  single: boolean;
  autoSave: boolean;
}) {
  const thumb = item.thumbnail || fallbackThumb;
  return (
    <li className="tile-in group overflow-hidden rounded-[1.25rem] bg-surface-2" style={{ '--n': index } as React.CSSProperties}>
      <div className={`relative overflow-hidden bg-line ${single ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[4/5]'}`}>
        {thumb && (
          <>
            {single && (
              <img src={thumb} alt="" aria-hidden referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
            )}
            <img
              src={thumb}
              alt=""
              referrerPolicy="no-referrer"
              className={`relative h-full w-full transition-transform duration-700 group-hover:scale-[1.03] ${single ? 'object-contain' : 'object-cover'}`}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {TYPE_LABEL[item.type]}
          {item.label ? `, ${item.label}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2 p-2.5 pl-3.5">
        <p className="min-w-0 flex-1 truncate text-xs text-muted">{formatBytes(item.size) ?? item.filename}</p>
        <SaveButton item={item} autoClick={autoSave} className="rounded-full bg-ink px-4 py-2 text-sm text-bg">
          Save
        </SaveButton>
      </div>
    </li>
  );
}

/** A real download link that flips to a mint "Saved" tick when tapped. */
function SaveButton({
  item,
  className,
  children,
  autoClick = false,
}: {
  item: ResolvedItem;
  className: string;
  children: React.ReactNode;
  /** Start the download as soon as it renders (Android share flow). */
  autoClick?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (autoClick) ref.current?.click();
  }, [autoClick]);
  return (
    <a
      ref={ref}
      href={item.download}
      download={item.filename}
      onClick={() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      }}
      className={`press inline-flex items-center gap-1.5 font-semibold transition-colors duration-300 ${className} ${saved ? '!bg-arrive !text-white' : ''}`}
    >
      {saved ? (
        <span key="saved" className="landed inline-flex items-center gap-1.5">
          <CheckIcon />
          Saved
        </span>
      ) : (
        <span key="save" className="inline-flex items-center gap-1.5">
          <DownloadIcon small />
          {children}
        </span>
      )}
    </a>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[1.75rem] border border-line bg-surface p-3 sm:p-4" aria-label="Loading">
      <div className="space-y-2 px-2 pb-4 pt-2">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-full" />
      </div>
      <div className="skeleton aspect-[4/3] w-full rounded-[1.25rem] sm:aspect-[16/10]" />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ small }: { small?: boolean }) {
  return (
    <svg className={small ? 'h-4 w-4' : 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M16 5h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2" />
    </svg>
  );
}
