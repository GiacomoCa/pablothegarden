'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Artist, LineupConfig } from '@/lib/types';

interface LineupPreviewProps {
  config: LineupConfig;
  artists: Artist[];
}

function MysteryCard({ message }: { message: string }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center rounded-candy bg-night-purple/10 border-2 border-dashed border-candy-pink/30 p-4 text-center">
      <span className="text-4xl" aria-hidden="true">
        ?
      </span>
      <p className="mt-2 text-sm text-text-primary/60">{message}</p>
    </div>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center rounded-candy bg-gradient-to-br from-candy-pink/10 to-bubblegum/10 p-4 text-center shadow-candy transition-transform duration-300 hover:scale-105">
      {artist.photo ? (
        <div className="mb-3 h-16 w-16 overflow-hidden rounded-full bg-candy-pink/20 sm:h-20 sm:w-20">
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🎧
          </div>
        </div>
      ) : (
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-candy-pink/20 text-2xl sm:h-20 sm:w-20">
          🎧
        </div>
      )}
      <p className="font-display text-sm font-bold text-text-primary sm:text-base">
        {artist.name}
      </p>
      {artist.genre && (
        <p className="mt-1 text-xs text-text-primary/60">{artist.genre}</p>
      )}
    </div>
  );
}

function ComingSoonPhase({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="rounded-candy bg-gradient-to-br from-candy-pink/10 to-bubblegum/10 p-8 shadow-candy md:p-12">
        {/* Mystery silhouettes */}
        <div className="mb-6 flex items-center justify-center gap-4" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-night-purple/10 text-2xl sm:h-20 sm:w-20"
            >
              ?
            </div>
          ))}
        </div>
        <h3 className="font-display text-xl font-bold text-candy-pink sm:text-2xl">
          {t('coming_soon')}
        </h3>
        <p className="mt-3 text-text-primary/70">
          {t('coming_soon_description')}
        </p>
        <p className="mt-4 text-sm font-medium text-candy-pink">
          {t('follow_cta')}
        </p>
      </div>
    </div>
  );
}

function RevealingPhase({
  artists,
  config,
  t,
}: {
  artists: Artist[];
  config: LineupConfig;
  t: ReturnType<typeof useTranslations>;
}) {
  const revealedArtists = artists.filter((a) => a.revealed);
  const remainingSlots = config.totalSlots - revealedArtists.length;

  return (
    <div>
      <p className="mb-6 text-center text-text-primary/70">
        {t('revealing_description')}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {revealedArtists.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} />
        ))}
        {Array.from({ length: Math.min(remainingSlots, 6 - revealedArtists.length) }).map(
          (_, i) => (
            <MysteryCard key={`mystery-${i}`} message={t('mystery_card')} />
          )
        )}
      </div>
      {remainingSlots > 0 && (
        <p className="mt-4 text-center text-sm text-text-primary/60">
          {t('slots_remaining', { count: remainingSlots })}
        </p>
      )}
    </div>
  );
}

function CompletePhase({
  artists,
  t,
}: {
  artists: Artist[];
  t: ReturnType<typeof useTranslations>;
}) {
  // Show top 6 headliners (by order)
  const headliners = artists.filter((a) => a.revealed).slice(0, 6);

  return (
    <div>
      <p className="mb-6 text-center text-text-primary/70">
        {t('complete_title')}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {headliners.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} />
        ))}
      </div>
    </div>
  );
}

export default function LineupPreview({ config, artists }: LineupPreviewProps) {
  const t = useTranslations('lineup');

  return (
    <section
      className="bg-soft-pink py-16 md:py-24"
      aria-label={t('title')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        {config.phase === 'coming_soon' && <ComingSoonPhase t={t} />}
        {config.phase === 'revealing' && (
          <RevealingPhase artists={artists} config={config} t={t} />
        )}
        {config.phase === 'complete' && (
          <CompletePhase artists={artists} t={t} />
        )}

        <div className="mt-10 text-center">
          <Link
            href="/lineup"
            className="inline-flex items-center gap-2 font-semibold text-candy-pink transition-colors hover:text-candy-pink-dark"
          >
            {t('view_full_lineup')}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
