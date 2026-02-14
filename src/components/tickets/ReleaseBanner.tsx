'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { TicketConfig } from '@/lib/types';

interface ReleaseBannerProps {
  ticketConfig: TicketConfig;
  locale: string;
}

type ReleaseKey = 'earlybird' | 'promo' | 'regular';

const RELEASE_ORDER: ReleaseKey[] = ['earlybird', 'promo', 'regular'];

function getStepState(
  releaseKey: ReleaseKey,
  ticketConfig: TicketConfig
): 'completed' | 'active' | 'upcoming' {
  const release = ticketConfig.releases[releaseKey];
  if (release.status === 'sold_out') return 'completed';
  if (release.status === 'active') return 'active';
  return 'upcoming';
}

export default function ReleaseBanner({
  ticketConfig,
  locale,
}: ReleaseBannerProps) {
  const t = useTranslations('tickets');
  const localeKey = locale as 'it' | 'en';

  return (
    <section className="mx-auto w-full max-w-3xl px-4" aria-label={t('release_progress')}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-candy bg-surface-elevated p-6 shadow-candy sm:p-8"
      >
        <h2 className="mb-6 text-center font-display text-lg font-bold text-text-primary sm:text-xl">
          {t('release_progress')}
        </h2>

        {/* Progress bar */}
        <div className="relative flex items-center justify-between">
          {/* Connecting line behind the steps */}
          <div
            className="absolute top-5 right-8 left-8 h-1 rounded-full bg-gray-200 sm:right-12 sm:left-12"
            aria-hidden="true"
          />
          {/* Filled line up to active step */}
          <div
            className="absolute top-5 left-8 h-1 rounded-full bg-gradient-to-r from-candy-pink to-orange-cream sm:left-12"
            style={{
              width: (() => {
                const activeIdx = RELEASE_ORDER.findIndex(
                  (k) => getStepState(k, ticketConfig) === 'active'
                );
                const completedCount = RELEASE_ORDER.filter(
                  (k) => getStepState(k, ticketConfig) === 'completed'
                ).length;
                if (completedCount === 3) return 'calc(100% - 4rem)';
                if (activeIdx === -1) return '0%';
                // Progress based on position
                const totalSegments = RELEASE_ORDER.length - 1;
                const progress = activeIdx / totalSegments;
                return `calc(${progress * 100}% - ${progress * 4}rem)`;
              })(),
            }}
            aria-hidden="true"
          />

          {RELEASE_ORDER.map((releaseKey) => {
            const state = getStepState(releaseKey, ticketConfig);
            const release = ticketConfig.releases[releaseKey];
            const label = release.label[localeKey];

            return (
              <div
                key={releaseKey}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                {/* Circle indicator */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    state === 'completed'
                      ? 'border-candy-pink bg-candy-pink text-white'
                      : state === 'active'
                        ? 'border-candy-pink bg-white text-candy-pink shadow-candy'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {state === 'completed' ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : state === 'active' ? (
                    <motion.div
                      className="h-3 w-3 rounded-full bg-candy-pink"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-center text-xs font-semibold sm:text-sm ${
                    state === 'completed'
                      ? 'text-text-primary/60'
                      : state === 'active'
                        ? 'text-candy-pink'
                        : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>

                {/* Status text */}
                <span
                  className={`text-center text-[10px] sm:text-xs ${
                    state === 'completed'
                      ? 'font-medium text-gray-400'
                      : state === 'active'
                        ? 'font-bold text-candy-pink'
                        : 'text-gray-400'
                  }`}
                >
                  {state === 'completed'
                    ? t('sold_out')
                    : state === 'active'
                      ? t('available')
                      : t('coming_soon')}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
