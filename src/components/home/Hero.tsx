'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import CandyParticles from '@/components/shared/CandyParticles';

export default function Hero() {
  const t = useTranslations('hero');
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: shouldReduceMotion ? {} : { opacity: 0, y: 20 },
    visible: shouldReduceMotion
      ? {}
      : {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
  };

  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-night-purple via-night-purple to-candy-pink/80 md:min-h-[calc(100vh-5rem)]"
      aria-label={t('title')}
    >
      {/* Candy confetti particles */}
      <CandyParticles />

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-night-purple/60 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-4xl px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-display text-4xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl"
          variants={itemVariants}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          className="mt-3 font-display text-xl text-candy-pink drop-shadow-md sm:text-2xl md:text-3xl"
          variants={itemVariants}
        >
          {t('subtitle')}
        </motion.p>

        <motion.div className="mt-6 space-y-1" variants={itemVariants}>
          <p className="text-base font-medium text-white/90 sm:text-lg md:text-xl">
            {t('dates')}
          </p>
          <p className="text-base text-white/70 sm:text-lg md:text-xl">{t('location')}</p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
          variants={itemVariants}
        >
          <Link
            href="/tickets"
            className="group inline-flex items-center justify-center rounded-pill bg-candy-pink px-8 py-4 text-base font-semibold text-white shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover sm:text-lg"
          >
            <motion.span
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {t('cta_tickets')}
            </motion.span>
          </Link>
          <Link
            href="/lineup"
            className="group inline-flex items-center justify-center rounded-pill border-2 border-white/60 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10 sm:text-lg"
          >
            <motion.span
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {t('cta_lineup')}
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
