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

function Badges({ artist }: { artist: LineupDayArtist }) {
  const t = useTranslations('lineup_home');
  const badges: string[] = [];
  if (artist.tag === 'closing') badges.push(t('badge_closing'));
  if (artist.tag === 'hiphop') badges.push(t('badge_hiphop'));
  if (artist.secondStage) badges.push(t('badge_second_stage'));

  if (badges.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-1">
      {badges.map((b) => (
        <span
          key={b}
          className="rounded-pill bg-candy-pink/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-candy-pink"
        >
          {b}
        </span>
      ))}
    </div>
  );
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
      className="w-40 flex-shrink-0 snap-start sm:w-48"
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-candy shadow-candy">
        {artist.photo ? (
          <Image
            src={artist.photo}
            alt={artist.name}
            fill
            sizes="(max-width: 640px) 160px, 192px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-candy-pink/30 to-bubblegum/30">
            <span className="font-display text-3xl font-bold text-candy-pink">
              {initials(artist.name)}
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center font-display text-base font-bold text-text-primary">
        {artist.name}
      </p>
      <Badges artist={artist} />
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
      <div className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 pt-2 scrollbar-thin snap-x sm:px-6 lg:px-8">
        {group.artists.map((artist) => (
          <ArtistCard key={artist.name} artist={artist} />
        ))}
      </div>
    </div>
  );
}

/**
 * Homepage lineup section — the lineup split into two horizontally scrolling
 * rows, one per festival day. Unannounced artists show a mystery placeholder.
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
