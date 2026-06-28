'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

interface ShowcaseEndCardProps {
  onDismiss: () => void;
}

/**
 * The showcase finale: after the rainbow portal fades to black, the homepage
 * hero wordmark ("Pablo The Garden" → "Candy Edition") animates in over the
 * black. Reuses the hero's exact typography + Framer Motion stagger so it reads
 * as the same brand moment. Click / tap / Esc dismisses (Esc handled upstream).
 */
export default function ShowcaseEndCard({ onDismiss }: ShowcaseEndCardProps) {
  const tHero = useTranslations('hero');
  const tTag = useTranslations('brandTagline');
  const tGame = useTranslations('game');
  const shouldReduceMotion = useReducedMotion();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShowHint(true), 2000);
    return () => window.clearTimeout(id);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
            ease: [0.21, 0.47, 0.32, 0.98] as const,
          },
        },
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black px-6 text-center"
      onClick={onDismiss}
    >
      <motion.div
        className="w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Image
            src="/images/logo/pablo.png"
            alt={tHero('title')}
            width={1600}
            height={402}
            priority
            className="mx-auto w-full max-w-[300px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] sm:max-w-[420px] md:max-w-[540px] lg:max-w-[620px]"
          />
        </motion.div>
        <motion.p
          className="mt-4 font-display text-2xl font-bold text-white drop-shadow-md sm:text-3xl md:text-4xl"
          variants={itemVariants}
        >
          {tHero('garden')}
        </motion.p>
        <motion.p
          className="mt-1 font-display text-xl text-candy-pink drop-shadow-md sm:text-2xl md:text-3xl"
          variants={itemVariants}
        >
          {tHero('subtitle')}
        </motion.p>
        <motion.p
          className="mt-6 font-display text-lg font-bold text-white/90 sm:text-xl md:text-2xl"
          variants={itemVariants}
        >
          {tTag('text')}
        </motion.p>
      </motion.div>

      {showHint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-6 text-xs text-white/60"
        >
          {tGame('showcase_exit_hint')}
        </motion.p>
      )}
    </div>
  );
}
