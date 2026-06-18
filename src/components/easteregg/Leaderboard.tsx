'use client';

import { useTranslations } from 'next-intl';
import type { ScoreEntry } from '@/lib/game/leaderboard';

interface LeaderboardProps {
  entries: ScoreEntry[];
  highlightIndex?: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ entries, highlightIndex = -1 }: LeaderboardProps) {
  const t = useTranslations('game');

  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">{t('empty_leaderboard')}</p>
    );
  }

  return (
    <ol className="flex flex-col gap-1.5" aria-label={t('leaderboard_title')}>
      {entries.map((e, i) => {
        const highlighted = i === highlightIndex;
        return (
          <li
            key={`${e.name}-${e.score}-${i}`}
            className={`flex items-center gap-3 rounded-pill px-3 py-2 text-sm transition-colors ${
              highlighted
                ? 'bg-candy-pink text-night-purple font-bold shadow-candy'
                : 'bg-white/5 text-text-primary'
            }`}
          >
            <span className="w-6 shrink-0 text-center font-display">
              {MEDALS[i] ?? i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{e.name}</span>
            <span className="shrink-0 font-display tabular-nums">{e.score}</span>
          </li>
        );
      })}
    </ol>
  );
}
