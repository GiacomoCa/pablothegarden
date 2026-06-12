'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Brand tagline block — a single memorable claim that positions Pablo The Garden
 * as an identity, not just an event. Dark background, large centered typography,
 * fade-in on scroll. Sits between the hero and the countdown.
 */
export default function BrandTagline() {
  const t = useTranslations('brandTagline');
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-night-purple py-20 md:py-32"
      aria-label={t('text')}
    >
      {/* Decorative candy blobs */}
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-candy-pink/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-bubblegum/20 blur-3xl"
        aria-hidden="true"
      />

      <motion.p
        className="relative z-10 mx-auto max-w-4xl px-6 text-center font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {t('text')}
      </motion.p>
    </section>
  );
}
