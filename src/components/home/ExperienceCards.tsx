'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

interface ExperienceItem {
  key: string;
  icon: string;
}

const EXPERIENCES: ExperienceItem[] = [
  { key: 'music', icon: '🎵' },
  { key: 'food', icon: '🍭' },
  { key: 'fun_zone', icon: '🎪' },
  { key: 'scenography', icon: '✨' },
];

export default function ExperienceCards() {
  const t = useTranslations('experience');
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-surface py-16 md:py-24" aria-label={t('title')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {EXPERIENCES.map((item, index) => (
            <motion.div
              key={item.key}
              className="group flex flex-col items-center rounded-candy bg-gradient-to-br from-soft-pink to-surface-elevated p-6 text-center shadow-candy transition-all duration-300 md:p-8"
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.02,
                      y: -4,
                      boxShadow: '0 8px 30px rgba(255, 107, 157, 0.4)',
                    }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span
                className="text-4xl transition-transform duration-300 group-hover:scale-110 md:text-5xl"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-text-primary md:text-xl">
                {t(`${item.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-primary/70 md:text-base">
                {t(`${item.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
