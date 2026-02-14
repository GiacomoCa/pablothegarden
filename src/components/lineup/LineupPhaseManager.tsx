'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { Artist, LineupConfig } from '@/lib/types';
import ArtistGrid from './ArtistGrid';
import DayFilter from './DayFilter';
import MysteryCard from './MysteryCard';

interface LineupPhaseManagerProps {
  config: LineupConfig;
  artists: Artist[];
}

function ComingSoonView({ config }: { config: LineupConfig }) {
  const t = useTranslations('lineup');

  return (
    <div className="space-y-10">
      {/* Teaser heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl font-bold text-candy-pink sm:text-4xl">
          {t('coming_soon')}
        </h2>
        <p className="mt-3 text-lg text-text-primary/70">
          {t('coming_soon_description')}
        </p>
      </motion.div>

      {/* Teaser graphic area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mx-auto max-w-2xl overflow-hidden rounded-candy bg-gradient-to-br from-candy-pink/20 via-bubblegum/20 to-night-purple/20 p-8 sm:p-12"
      >
        <div className="absolute inset-0 animate-[shimmer_3s_ease-in-out_infinite] bg-[linear-gradient(110deg,transparent_25%,rgba(255,107,157,0.1)_50%,transparent_75%)] bg-[length:200%_100%]" />
        <div className="relative flex flex-col items-center justify-center py-8 text-center">
          {/* Candy icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-candy-pink/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-10 w-10 text-candy-pink"
              aria-hidden="true"
            >
              <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" />
            </svg>
          </div>
          <p className="font-display text-xl font-bold text-night-purple sm:text-2xl">
            {t('coming_soon')}
          </p>
          <p className="mt-2 text-sm text-text-primary/60">
            {t('slots_remaining', { count: config.totalSlots })}
          </p>
        </div>
      </motion.div>

      {/* Mystery card grid preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
      >
        {Array.from({ length: Math.min(config.totalSlots, 8) }).map(
          (_, i) => (
            <MysteryCard key={`coming-soon-${i}`} />
          )
        )}
      </motion.div>

      {/* Instagram CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center"
      >
        <p className="mb-4 text-text-primary/70">
          {t('follow_cta')}
        </p>
        <a
          href="https://www.instagram.com/pablo_thegarden/"
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2
            rounded-pill bg-candy-pink px-6 py-3
            text-sm font-semibold text-white
            shadow-candy
            transition-all duration-200
            hover:bg-candy-pink-dark hover:shadow-candy-hover
          "
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          @pablo_thegarden
        </a>
      </motion.div>
    </div>
  );
}

function RevealingView({
  config,
  artists,
}: {
  config: LineupConfig;
  artists: Artist[];
}) {
  const t = useTranslations('lineup');
  const revealedCount = artists.filter((a) => a.revealed).length;
  const remainingCount = config.totalSlots - revealedCount;

  return (
    <div className="space-y-8">
      {/* Phase heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl font-bold text-candy-pink sm:text-4xl">
          {t('revealing_title')}
        </h2>
        <p className="mt-3 text-lg text-text-primary/70">
          {t('revealing_description')}
        </p>
        {remainingCount > 0 && (
          <p className="mt-2 text-sm text-text-primary/50">
            {t('slots_remaining', { count: remainingCount })}
          </p>
        )}
      </motion.div>

      {/* Artist + mystery grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ArtistGrid artists={artists} config={config} />
      </motion.div>
    </div>
  );
}

function CompleteView({
  config,
  artists,
}: {
  config: LineupConfig;
  artists: Artist[];
}) {
  const t = useTranslations('lineup');
  const [dayFilter, setDayFilter] = useState<'all' | 1 | 2>('all');

  return (
    <div className="space-y-8">
      {/* Phase heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl font-bold text-candy-pink sm:text-4xl">
          {t('complete_title')}
        </h2>
      </motion.div>

      {/* Day filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <DayFilter activeFilter={dayFilter} onFilterChange={setDayFilter} />
      </motion.div>

      {/* Artist grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ArtistGrid
          artists={artists}
          config={config}
          filterDay={dayFilter}
        />
      </motion.div>
    </div>
  );
}

export default function LineupPhaseManager({
  config,
  artists,
}: LineupPhaseManagerProps) {
  switch (config.phase) {
    case 'coming_soon':
      return <ComingSoonView config={config} />;
    case 'revealing':
      return <RevealingView config={config} artists={artists} />;
    case 'complete':
      return <CompleteView config={config} artists={artists} />;
    default:
      return <ComingSoonView config={config} />;
  }
}
