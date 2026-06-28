'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

interface ShowcaseEndCardProps {
  onDismiss: () => void;
}

/**
 * The showcase finale: the moment Pablo enters the portal, the homepage hero
 * wordmark ("Pablo The Garden" → "Candy Edition") fades in quickly — timed to
 * the portal's expansion + fade-to-black happening on the canvas underneath.
 * Transparent background (the canvas provides the portal → black); a soft radial
 * scrim keeps the wordmark legible over the bright portal during the overlap.
 * Click / tap / Esc dismisses (Esc handled upstream). Music keeps playing.
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

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6 text-center"
      onClick={onDismiss}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {/* soft scrim for legibility over the bright portal */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6),rgba(0,0,0,0)_72%)]" />

        <div className="relative w-full max-w-3xl">
          <Image
            src="/images/logo/pablo.png"
            alt={tHero('title')}
            width={1600}
            height={402}
            priority
            className="mx-auto w-full max-w-[300px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] sm:max-w-[420px] md:max-w-[540px] lg:max-w-[620px]"
          />
          <p className="mt-4 font-display text-2xl font-bold text-white drop-shadow-md sm:text-3xl md:text-4xl">
            {tHero('garden')}
          </p>
          <p className="mt-1 font-display text-xl text-candy-pink drop-shadow-md sm:text-2xl md:text-3xl">
            {tHero('subtitle')}
          </p>
          <p className="mt-6 font-display text-lg font-bold text-white/90 drop-shadow-md sm:text-xl md:text-2xl">
            {tTag('text')}
          </p>
        </div>
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
