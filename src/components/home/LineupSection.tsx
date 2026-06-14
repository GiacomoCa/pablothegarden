'use client';

import { useState, useEffect } from 'react';
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

function ArtistCard({
  artist,
  open,
  onChange,
}: {
  artist: LineupDayArtist;
  open: boolean;
  onChange: (next: boolean) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('lineup_home');
  // Devices with a mouse use hover; touch devices use a single tap.
  const [hasHover, setHasHover] = useState(false);
  useEffect(() => {
    setHasHover(window.matchMedia('(hover: hover)').matches);
  }, []);

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

  // Hover (desktop) opens/closes; tap (touch) toggles. Both go through the
  // parent so only one card can be open at a time.
  const interaction = hasHover
    ? {
        onMouseEnter: () => onChange(true),
        onMouseLeave: () => onChange(false),
      }
    : { onClick: () => onChange(!open) };

  return (
    <motion.div
      className="relative z-0 w-40 flex-shrink-0 cursor-pointer snap-start sm:w-48"
      style={{ zIndex: open ? 20 : 0 }}
      {...interaction}
      animate={shouldReduceMotion ? {} : { scale: open ? 1.3 : 1, y: open ? -10 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-candy ring-candy-pink transition-shadow duration-300 ${
          open
            ? 'shadow-[0_0_50px_12px_rgba(255,205,255,0.65)] ring-4'
            : 'shadow-candy ring-0'
        }`}
      >
        {artist.photo ? (
          <Image
            src={artist.photo}
            alt={artist.name}
            fill
            sizes="(max-width: 640px) 160px, 192px"
            className={`object-cover transition-transform duration-500 ease-out ${
              open ? 'scale-[1.3]' : 'scale-100'
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-candy-pink/30 to-bubblegum/30">
            <span className="font-display text-3xl font-bold text-candy-pink">
              {initials(artist.name)}
            </span>
          </div>
        )}

        {/* Bio overlay revealed on hover / tap */}
        {artist.bio && (
          <div
            className={`absolute inset-0 flex items-end overflow-y-auto bg-gradient-to-t from-night-purple/95 via-night-purple/55 to-transparent transition-opacity duration-300 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
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

function DayRow({
  group,
  openId,
  setOpenId,
}: {
  group: LineupDayGroup;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const t = useTranslations('lineup_home');
  const dayLabel = group.day === 1 ? t('day1') : t('day2');
  // Alphabetical order so no artist is favored over another
  const artists = [...group.artists].sort((a, b) =>
    a.name.localeCompare(b.name, 'it')
  );

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
      <div className="flex gap-6 overflow-x-auto scroll-smooth px-6 pb-14 pt-14 scrollbar-thin snap-x lg:px-8">
        {artists.map((artist) => {
          const id = `${group.day}-${artist.name}`;
          return (
            <ArtistCard
              key={id}
              artist={artist}
              open={openId === id}
              onChange={(next) => setOpenId(next ? id : null)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Homepage lineup section — the lineup split into two horizontally scrolling
 * rows, one per festival day. Revealed artists show a photo that zooms and
 * reveals a short bio on hover/tap; only one card can be open at a time.
 */
export default function LineupSection({ days }: LineupSectionProps) {
  const t = useTranslations('lineup_home');
  // A single source of truth so at most one card is highlighted/zoomed.
  const [openId, setOpenId] = useState<string | null>(null);

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
            <DayRow
              key={group.day}
              group={group}
              openId={openId}
              setOpenId={setOpenId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
