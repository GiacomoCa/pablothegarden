'use client';

import { useTranslations } from 'next-intl';

interface Edition {
  key: string;
  year: string;
  emoji: string;
  isCurrent: boolean;
}

const EDITIONS: Edition[] = [
  { key: 'edition_2023', year: '2023', emoji: '🦜', isCurrent: false },
  { key: 'edition_2024', year: '2024', emoji: '🌴', isCurrent: false },
  { key: 'edition_2025', year: '2025', emoji: '🌸', isCurrent: false },
  { key: 'edition_2026', year: '2026', emoji: '🍬', isCurrent: true },
];

export default function EditionTimeline() {
  const t = useTranslations('editions');

  return (
    <section
      className="bg-gradient-to-b from-surface to-soft-pink py-16 md:py-24"
      aria-label={t('title')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        {/* Mobile: horizontal scrollable strip */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {EDITIONS.map((edition) => (
              <div
                key={edition.key}
                className={`flex min-w-[220px] flex-shrink-0 flex-col rounded-candy p-5 shadow-candy ${
                  edition.isCurrent
                    ? 'bg-gradient-to-br from-candy-pink to-candy-pink-dark text-white'
                    : 'bg-surface'
                }`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {edition.emoji}
                </span>
                <span
                  className={`mt-3 font-display text-2xl font-bold ${
                    edition.isCurrent ? 'text-white' : 'text-candy-pink'
                  }`}
                >
                  {t(`${edition.key}.year`)}
                </span>
                <span
                  className={`mt-1 font-display text-sm font-bold ${
                    edition.isCurrent ? 'text-white/90' : 'text-text-primary'
                  }`}
                >
                  {t(`${edition.key}.name`)}
                </span>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    edition.isCurrent ? 'text-white/80' : 'text-text-primary/60'
                  }`}
                >
                  {t(`${edition.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid with connecting line */}
        <div className="relative hidden md:block">
          {/* Decorative connecting line */}
          <div
            className="absolute left-0 right-0 top-[60px] h-1 rounded-full bg-gradient-to-r from-candy-pink/20 via-candy-pink to-candy-pink/20"
            aria-hidden="true"
          />

          <div className="grid grid-cols-4 gap-6">
            {EDITIONS.map((edition) => (
              <div key={edition.key} className="relative flex flex-col items-center">
                {/* Dot on the line */}
                <div
                  className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-candy ${
                    edition.isCurrent
                      ? 'bg-candy-pink text-white'
                      : 'bg-surface border-2 border-candy-pink/30'
                  }`}
                  aria-hidden="true"
                >
                  {edition.emoji}
                </div>

                {/* Card */}
                <div
                  className={`w-full rounded-candy p-6 text-center shadow-candy transition-all duration-300 hover:-translate-y-1 hover:shadow-candy-hover ${
                    edition.isCurrent
                      ? 'bg-gradient-to-br from-candy-pink to-candy-pink-dark text-white'
                      : 'bg-surface'
                  }`}
                >
                  <span
                    className={`font-display text-3xl font-bold ${
                      edition.isCurrent ? 'text-white' : 'text-candy-pink'
                    }`}
                  >
                    {t(`${edition.key}.year`)}
                  </span>
                  <h3
                    className={`mt-1 font-display text-base font-bold ${
                      edition.isCurrent ? 'text-white/90' : 'text-text-primary'
                    }`}
                  >
                    {t(`${edition.key}.name`)}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      edition.isCurrent ? 'text-white/80' : 'text-text-primary/60'
                    }`}
                  >
                    {t(`${edition.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
