'use client';

import { useState } from 'react';

// "download" with its vowels marked; they fall away on load, leaving "dwnld".
// Each falling vowel gets its own tumble so the drop doesn't look mechanical.
const LETTERS: { c: string; vowel?: { i: number; r: string } }[] = [
  { c: 'd' },
  { c: 'o', vowel: { i: 0, r: '-28deg' } },
  { c: 'w' },
  { c: 'n' },
  { c: 'l' },
  { c: 'o', vowel: { i: 1, r: '34deg' } },
  { c: 'a', vowel: { i: 2, r: '-14deg' } },
  { c: 'd' },
];

export default function Wordmark() {
  // Tapping the wordmark replays the drop.
  const [run, setRun] = useState(0);

  return (
    <div
      key={run}
      className="wordmark text-ink"
      aria-hidden
      onClick={() => setRun((n) => n + 1)}
      title="dwnld"
    >
      {LETTERS.map(({ c, vowel }, idx) =>
        vowel ? (
          <span key={idx} className="slot" style={{ '--i': vowel.i } as React.CSSProperties}>
            <span>
              <span className="vowel" style={{ '--i': vowel.i, '--r': vowel.r } as React.CSSProperties}>
                {c}
              </span>
            </span>
          </span>
        ) : (
          <span key={idx}>{c}</span>
        ),
      )}
    </div>
  );
}
