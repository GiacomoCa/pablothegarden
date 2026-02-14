'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

const CANDY_EMOJIS = ['🍬', '🍭', '🍩', '🧁', '🍪', '🎀', '🍫', '🍰'];

interface CandyParticleProps {
  emoji: string;
  index: number;
}

function CandyParticle({ emoji, index }: CandyParticleProps) {
  const leftPosition = 10 + (index * 80) / CANDY_EMOJIS.length;
  const duration = 6 + (index % 3) * 2;
  const delay = index * 0.7;
  const size = 20 + (index % 3) * 8;

  return (
    <motion.span
      className="pointer-events-none absolute select-none"
      style={{
        left: `${leftPosition}%`,
        fontSize: `${size}px`,
        top: '-40px',
      }}
      initial={{ y: -40, opacity: 0, rotate: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        opacity: [0, 1, 1, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-hidden="true"
    >
      {emoji}
    </motion.span>
  );
}

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-night-purple via-night-purple to-candy-pink/80 md:min-h-[calc(100vh-5rem)]"
      aria-label={t('title')}
    >
      {/* Candy confetti particles */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {CANDY_EMOJIS.map((emoji, i) => (
          <CandyParticle key={i} emoji={emoji} index={i} />
        ))}
      </div>

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-night-purple/60 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 px-4 text-center">
        <motion.h1
          className="font-display text-5xl font-bold text-white drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          className="mt-3 font-display text-2xl text-candy-pink drop-shadow-md sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          className="mt-6 space-y-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          <p className="text-lg font-medium text-white/90 sm:text-xl">
            {t('dates')}
          </p>
          <p className="text-lg text-white/70 sm:text-xl">{t('location')}</p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          <Link
            href="/tickets"
            className="inline-flex items-center rounded-pill bg-candy-pink px-8 py-4 text-lg font-semibold text-white shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover hover:scale-105"
          >
            {t('cta_tickets')}
          </Link>
          <Link
            href="/lineup"
            className="inline-flex items-center rounded-pill border-2 border-white/60 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10"
          >
            {t('cta_lineup')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
