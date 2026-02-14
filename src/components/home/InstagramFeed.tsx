'use client';

import { useTranslations } from 'next-intl';

const INSTAGRAM_URL = 'https://www.instagram.com/pablo_thegarden';

export default function InstagramFeed() {
  const t = useTranslations('instagram');

  return (
    <section className="bg-surface py-16 md:py-24" aria-label={t('title')}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-candy bg-gradient-to-br from-candy-pink via-orange-cream to-bubblegum p-1 shadow-candy">
          <div className="rounded-[calc(1.5rem-4px)] bg-surface p-8 text-center md:p-12">
            {/* Instagram icon */}
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-candy-pink to-orange-cream md:h-20 md:w-20"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
              </svg>
            </div>

            <h2 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
              {t('title')}
            </h2>
            <p className="mt-2 text-text-primary/70">
              {t('subtitle')}
            </p>

            <div className="mt-8">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-pill bg-gradient-to-r from-candy-pink to-orange-cream px-8 py-4 text-lg font-semibold text-white shadow-candy transition-all duration-300 hover:shadow-candy-hover hover:scale-105"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                {t('follow_us')}
              </a>
            </div>

            {/* Decorative candy elements */}
            <div
              className="mt-8 flex items-center justify-center gap-3"
              aria-hidden="true"
            >
              {['🍬', '🍭', '🧁', '🍩', '🍪'].map((emoji, i) => (
                <span key={i} className="text-2xl opacity-40">
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
