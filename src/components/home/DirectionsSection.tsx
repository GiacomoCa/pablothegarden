'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

// Venue marker (matches the Google Maps pin shared by the organisers).
const MAPS_SHORT_URL = 'https://maps.app.goo.gl/HBkBTKsGqS1XBbyM9';
const VENUE_QUERY = 'Pablo The Garden, Via Cunicchio 45, 62010 Morrovalle MC';
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  VENUE_QUERY
)}`;
// Remember the visitor's choice so the map auto-loads on later visits.
const MAPS_CONSENT_KEY = 'pablo-maps-consent';

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ParkingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17V7h3.25a2.75 2.75 0 010 5.5H9.5" />
    </svg>
  );
}

export default function DirectionsSection() {
  const t = useTranslations('directions');
  const locale = useLocale();
  const [mapLoaded, setMapLoaded] = useState(false);

  // The Google Maps embed sets third-party cookies, so it is never loaded until
  // the visitor asks for it (GDPR-friendly click-to-load). Once chosen, the
  // preference is remembered. Reading localStorage in an effect keeps the first
  // render identical on server and client (no hydration mismatch).
  useEffect(() => {
    try {
      if (window.localStorage.getItem(MAPS_CONSENT_KEY) === 'granted') setMapLoaded(true);
    } catch {
      /* private mode / blocked — keep the placeholder */
    }
  }, []);

  const loadMap = () => {
    setMapLoaded(true);
    try {
      window.localStorage.setItem(MAPS_CONSENT_KEY, 'granted');
    } catch {
      /* ignore */
    }
  };

  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    VENUE_QUERY
  )}&z=15&hl=${locale}&output=embed`;

  return (
    <section
      className="relative overflow-hidden bg-soft-pink py-16 md:py-24"
      aria-label={t('title')}
    >
      {/* Decorative candy glows */}
      <div
        className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-candy-pink/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cotton-candy/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center md:mb-12">
          <span className="font-display text-sm font-semibold uppercase tracking-widest text-candy-pink">
            {t('eyebrow')}
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Info card */}
          <div className="flex flex-col gap-6 rounded-candy bg-surface p-6 shadow-candy sm:p-8">
            <div className="flex items-start gap-4">
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink"
                aria-hidden="true"
              >
                <PinIcon className="h-6 w-6" />
              </span>
              <div>
                <span className="block font-display text-lg font-bold text-text-primary">
                  {t('venue_name')}
                </span>
                <span className="mt-0.5 block text-text-primary/80">{t('address')}</span>
                <span className="block text-text-primary/60">{t('address_region')}</span>
              </div>
            </div>

            <p className="text-text-primary/80">{t('body')}</p>

            {/* Free parking — the property immediately after the Villa */}
            <div className="flex items-start gap-4 rounded-candy bg-candy-pink/5 p-4 ring-1 ring-candy-pink/15">
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink"
                aria-hidden="true"
              >
                <ParkingIcon className="h-6 w-6" />
              </span>
              <div>
                <span className="block font-display text-lg font-bold text-text-primary">
                  {t('parking_title')}
                </span>
                <span className="mt-0.5 block text-text-primary/80">{t('parking_body')}</span>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <a
                href={MAPS_SHORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-candy-pink px-6 py-3 font-semibold text-night-purple shadow-candy transition-all duration-300 hover:scale-[1.03] hover:bg-candy-pink-dark hover:shadow-candy-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-candy-pink focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <PinIcon className="h-5 w-5" />
                {t('open_maps')}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill border border-candy-pink/40 px-6 py-3 font-semibold text-candy-pink transition-colors hover:bg-candy-pink hover:text-night-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-candy-pink focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {t('directions_cta')}
              </a>
            </div>
          </div>

          {/* Map (click-to-load) */}
          <div className="relative min-h-[300px] overflow-hidden rounded-candy shadow-candy ring-1 ring-white/5 sm:min-h-[360px]">
            {mapLoaded ? (
              <iframe
                title={t('map_title')}
                src={embedSrc}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={loadMap}
                className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-surface-elevated to-night-purple p-6 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-candy-pink"
                aria-label={t('map_load')}
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-candy-pink/15 text-candy-pink transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <PinIcon className="h-8 w-8" />
                </span>
                <span className="rounded-pill bg-candy-pink px-6 py-3 font-semibold text-night-purple shadow-candy transition-transform duration-300 group-hover:scale-105">
                  {t('map_load')}
                </span>
                <span className="max-w-xs text-xs leading-relaxed text-text-primary/60">
                  {t('map_consent_note')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
