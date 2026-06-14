'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import type { LineupDayArtist, LineupDayGroup } from '@/lib/types';

interface LineupSectionProps {
  days: LineupDayGroup[];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();
}

function ArtistCard({ artist }: { artist: LineupDayArtist }) {
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('lineup_home');

  if (!artist.revealed) {
    // Unannounced artist — catchy mystery placeholder
    return (
      <div className="w-40 flex-shrink-0 snap-start sm:w-48">
        <div className="flex aspect-square w-full flex-col items-center justify-center rounded-candy border-2 border-dashed border-candy-pink/40 bg-surface/40">
          <span className="font-display text-5xl font-bold text-candy-pink">?</span>
        </div>
        <p className="mt-3 text-center font-display text-sm font-bold text-candy-pink sm:text-base">
          {t('coming_soon')}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="group relative z-0 w-40 flex-shrink-0 snap-start hover:z-20 sm:w-48"
      whileHover={shouldReduceMotion ? {} : { scale: 1.06, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-candy shadow-candy">
        {artist.photo ? (
          <Image
            src={artist.photo}
            alt={artist.name}
            fill
            sizes="(max-width: 640px) 160px, 192px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-candy-pink/30 to-bubblegum/30">
            <span className="font-display text-3xl font-bold text-candy-pink">
              {initials(artist.name)}
            </span>
          </div>
        )}

        {/* Bio overlay revealed on hover */}
        {artist.bio && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-night-purple/95 via-night-purple/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="p-3 text-left text-[11px] leading-snug text-white sm:text-xs">
              {artist.bio}
            </p>
          </div>
        )}
      </div>
      <p className="mt-3 text-center font-display text-base font-bold text-text-primary">
        {artist.name}
      </p>
    </motion.div>
  );
}

function DayRow({ group }: { group: LineupDayGroup }) {
  const t = useTranslations('lineup_home');
  const dayLabel = group.day === 1 ? t('day1') : t('day2');

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
        <span className="rounded-pill bg-candy-pink px-4 py-1.5 font-display text-sm font-bold text-night-purple">
          {`Day ${group.day}`}
        </span>
        <span className="font-display text-lg font-bold text-text-primary sm:text-xl">
          {dayLabel}
        </span>
      </div>

      {/* Horizontally scrolling artist strip */}
      <div className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-6 pt-4 scrollbar-thin snap-x sm:px-6 lg:px-8">
        {group.artists.map((artist) => (
          <ArtistCard key={artist.name} artist={artist} />
        ))}
      </div>
    </div>
  );
}

/**
 * Homepage lineup section — the lineup split into two horizontally scrolling
 * rows, one per festival day. Revealed artists show a photo that zooms and
 * reveals a short bio on hover; unannounced artists show a mystery placeholder.
 */
export default function LineupSection({ days }: LineupSectionProps) {
  const t = useTranslations('lineup_home');

  if (days.length === 0) return null;

  return (
    <section className="bg-soft-pink py-16 md:py-24" aria-label={t('title')}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-candy-pink sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        <div className="space-y-10">
          {days.map((group) => (
            <DayRow key={group.day} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}
