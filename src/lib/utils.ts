// =============================================================================
// Utility functions for Pablo The Garden
// =============================================================================

/**
 * Check if an artist was recently revealed (within `newBadgeDays` of today).
 *
 * Returns `true` when the reveal date is in the past (or today) AND
 * fewer than `newBadgeDays` days have elapsed since then.
 */
export function isNewlyRevealed(
  revealDate: string,
  newBadgeDays: number
): boolean {
  const reveal = new Date(revealDate);
  const now = new Date();

  // If the reveal date is in the future, not revealed yet
  if (reveal.getTime() > now.getTime()) {
    return false;
  }

  const diffMs = now.getTime() - reveal.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= newBadgeDays;
}

/**
 * Format an ISO date string for display using the Intl API.
 *
 * Example output:
 *   - locale "it": "15 agosto 2026"
 *   - locale "en": "August 15, 2026"
 */
export function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);

  // Map our short locale codes to full BCP 47 tags
  const localeMap: Record<string, string> = {
    it: 'it-IT',
    en: 'en-US',
  };

  const resolvedLocale = localeMap[locale] ?? locale;

  return date.toLocaleDateString(resolvedLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Extract a localized string from an `{ it, en }` object.
 * Falls back to Italian if the requested locale is not found.
 */
export function getLocalizedString(
  obj: { it: string; en: string },
  locale: string
): string {
  if (locale === 'en') return obj.en;
  return obj.it;
}
