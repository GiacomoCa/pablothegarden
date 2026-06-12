'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import type { FestivalStat } from '@/lib/types';

interface StatsCounterProps {
  stats: FestivalStat[];
}

// Candy palette cycled across the counters for a colorful, playful look.
const NUMBER_COLORS = [
  'text-candy-pink',
  'text-orange-cream',
  'text-cotton-candy',
  'text-mint-green',
  'text-bubblegum',
];

function StatItem({ stat, index }: { stat: FestivalStat; index: number }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (shouldReduceMotion) {
      setDisplay(stat.value);
      return;
    }

    const controls = animate(0, stat.value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });

    return () => controls.stop();
  }, [inView, shouldReduceMotion, stat.value]);

  const label = locale === 'it' ? stat.label_it : stat.label_en;
  const formatted = display.toLocaleString(locale === 'it' ? 'it-IT' : 'en-US');
  const colorClass = NUMBER_COLORS[index % NUMBER_COLORS.length];

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span
        className={`font-display text-4xl font-bold tabular-nums sm:text-5xl md:text-6xl ${colorClass}`}
      >
        {stat.prefix ?? ''}
        {formatted}
        {stat.suffix ?? ''}
      </span>
      <span className="mt-2 text-sm font-medium uppercase tracking-wide text-white/70 sm:text-base">
        {label}
      </span>
    </div>
  );
}

/**
 * Animated festival statistics. Numbers count up when the section enters the
 * viewport (Intersection Observer via Framer Motion). Respects reduced motion.
 */
export default function StatsCounter({ stats }: StatsCounterProps) {
  const t = useTranslations('statsSection');

  if (stats.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden bg-night-purple py-16 md:py-24"
      aria-label={t('title')}
    >
      {/* Decorative candy blobs */}
      <div
        className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-candy-pink/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-orange-cream/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-white/70">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatItem key={stat.label_en} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
