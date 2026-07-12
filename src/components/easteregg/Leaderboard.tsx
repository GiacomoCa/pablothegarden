'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { ScoreEntry } from '@/lib/game/leaderboard';

interface LeaderboardProps {
  entries: ScoreEntry[];
  highlightIndex?: number;
  loading?: boolean;
  /** The player's all-time best (device-local). Always shown, highlighted. */
  personalBest?: number;
  /** Name to show alongside the personal best, if known. */
  personalName?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({
  entries,
  highlightIndex = -1,
  loading = false,
  personalBest = 0,
  personalName,
}: LeaderboardProps) {
  const t = useTranslations('game');

  // With 100 rows the board scrolls, so bring the player's freshly submitted
  // entry into view — landing at rank 57 and having to hunt for yourself is
  // the main UX trap of a long list.
  const highlightRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    if (highlightIndex >= 0) highlightRef.current?.scrollIntoView({ block: 'center' });
  }, [highlightIndex, entries]);

  // The player's personal best — pinned so they always see their score, even
  // when it is outside the global top 100. Hidden when that same score is already
  // shown in the list (the board keeps one row per device, so an in-list
  // personal best would otherwise be displayed twice). No aria-label: the
  // visible text is the accessible name (the ⭐ is decorative), exactly like the
  // ranked rows below.
  const personalInList =
    personalBest > 0 &&
    entries.some(
      (e) => e.score === personalBest && (personalName ? e.name === personalName : true)
    );
  const personalRow =
    personalBest > 0 && !personalInList ? (
      <div className="mt-2 flex items-center gap-3 rounded-pill bg-candy-pink/15 px-3 py-2 text-sm ring-1 ring-candy-pink/40">
        <span className="w-7 shrink-0 text-center" aria-hidden="true">
          ⭐
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold text-candy-pink">
          {t('your_record')}
          {personalName ? ` · ${personalName}` : ''}
        </span>
        <span className="shrink-0 font-display font-bold tabular-nums text-candy-pink">
          {personalBest}
        </span>
      </div>
    ) : null;

  if (loading && entries.length === 0) {
    return (
      <div>
        <p className="py-6 text-center text-sm text-text-muted" role="status">
          {t('loading')}
        </p>
        {personalRow}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div>
        <p className="py-6 text-center text-sm text-text-muted">{t('empty_leaderboard')}</p>
        {personalRow}
      </div>
    );
  }

  return (
    <div>
      <ol className="flex flex-col gap-1.5" aria-label={t('leaderboard_title')}>
        {entries.map((e, i) => {
          const highlighted = i === highlightIndex;
          return (
            <li
              key={`${e.name}-${e.score}-${i}`}
              ref={highlighted ? highlightRef : undefined}
              className={`flex items-center gap-3 rounded-pill px-3 py-2 text-sm transition-colors ${
                highlighted
                  ? 'bg-candy-pink text-night-purple font-bold shadow-candy'
                  : 'bg-white/5 text-text-primary'
              }`}
            >
              <span className="w-7 shrink-0 text-center font-display tabular-nums">
                {MEDALS[i] ?? i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{e.name}</span>
              <span className="shrink-0 font-display tabular-nums">{e.score}</span>
            </li>
          );
        })}
      </ol>
      {personalRow}
    </div>
  );
}
