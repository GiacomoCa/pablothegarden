'use client';

import type { Artist, LineupConfig } from '@/lib/types';
import { isNewlyRevealed } from '@/lib/utils';
import ArtistCard from './ArtistCard';
import MysteryCard from './MysteryCard';

interface ArtistGridProps {
  artists: Artist[];
  config: LineupConfig;
  filterDay?: 'all' | 1 | 2;
}

export default function ArtistGrid({
  artists,
  config,
  filterDay = 'all',
}: ArtistGridProps) {
  const isComplete = config.phase === 'complete';

  // Get revealed artists
  const revealedArtists = artists.filter((a) => a.revealed);

  // Apply day filter
  const filteredArtists =
    filterDay === 'all'
      ? revealedArtists
      : revealedArtists.filter((a) => a.day === filterDay);

  // Count mystery cards (unrevealed slots)
  const mysteryCount = isComplete
    ? 0
    : config.totalSlots - revealedArtists.length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      {/* Revealed artist cards */}
      {filteredArtists.map((artist) => (
        <ArtistCard
          key={artist.slug}
          artist={artist}
          isNew={isNewlyRevealed(artist.revealDate, config.newBadgeDays)}
        />
      ))}

      {/* Mystery cards for unrevealed slots (only in non-complete phases) */}
      {!isComplete &&
        filterDay === 'all' &&
        Array.from({ length: Math.max(0, mysteryCount) }).map((_, i) => (
          <MysteryCard key={`mystery-${i}`} />
        ))}
    </div>
  );
}
