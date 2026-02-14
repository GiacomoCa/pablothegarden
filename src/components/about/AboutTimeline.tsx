'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface Edition {
  key: string;
  year: string;
  emoji: string;
  isCurrent: boolean;
}

const EDITIONS: Edition[] = [
  { key: 'edition_2023', year: '2023', emoji: '\u{1F99C}', isCurrent: false },
  { key: 'edition_2024', year: '2024', emoji: '\u{1F334}', isCurrent: false },
  { key: 'edition_2025', year: '2025', emoji: '\u{1F338}', isCurrent: false },
  { key: 'edition_2026', year: '2026', emoji: '\u{1F36C}', isCurrent: true },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function AboutTimeline() {
  const t = useTranslations('editions');
  const tAbout = useTranslations('about');

  return (
    <section className="py-16 md:py-24" aria-label={tAbout('timeline_title')}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="mx-auto max-w-4xl"
      >
        <motion.h2
          variants={itemVariants}
          className="mb-12 text-center font-display text-3xl font-bold text-night-purple sm:text-4xl"
        >
          {tAbout('timeline_title')}
        </motion.h2>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-candy-pink/20 via-candy-pink to-candy-pink/20 sm:left-1/2 sm:-translate-x-px"
            aria-hidden="true"
          />

          <div className="space-y-12">
            {EDITIONS.map((edition, index) => {
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={edition.key}
                  variants={itemVariants}
                  className="relative flex items-start gap-6 sm:items-center"
                >
                  {/* Desktop left card */}
                  <div
                    className={`hidden sm:block sm:w-1/2 ${
                      isLeft ? 'sm:pr-12 sm:text-right' : 'sm:pr-12 sm:opacity-0'
                    }`}
                  >
                    {isLeft && (
                      <TimelineCard edition={edition} />
                    )}
                  </div>

                  {/* Center dot */}
                  <div
                    className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg shadow-candy sm:absolute sm:left-1/2 sm:-translate-x-1/2 ${
                      edition.isCurrent
                        ? 'bg-candy-pink text-white'
                        : 'border-2 border-candy-pink/30 bg-surface'
                    }`}
                    aria-hidden="true"
                  >
                    {edition.emoji}
                  </div>

                  {/* Desktop right card */}
                  <div
                    className={`hidden sm:block sm:w-1/2 ${
                      !isLeft ? 'sm:pl-12' : 'sm:pl-12 sm:opacity-0'
                    }`}
                  >
                    {!isLeft && (
                      <TimelineCard edition={edition} />
                    )}
                  </div>

                  {/* Mobile card (always on the right of the dot) */}
                  <div className="flex-1 sm:hidden">
                    <TimelineCard edition={edition} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TimelineCard({ edition }: { edition: Edition }) {
  const t = useTranslations('editions');

  return (
    <div
      className={`rounded-candy p-6 shadow-candy transition-all duration-300 hover:-translate-y-1 hover:shadow-candy-hover ${
        edition.isCurrent
          ? 'bg-gradient-to-br from-candy-pink to-candy-pink-dark text-white'
          : 'bg-surface'
      }`}
    >
      <span
        className={`font-display text-2xl font-bold ${
          edition.isCurrent ? 'text-white' : 'text-candy-pink'
        }`}
      >
        {t(`${edition.key}.year`)}
      </span>
      <h3
        className={`mt-1 font-display text-lg font-bold ${
          edition.isCurrent ? 'text-white/90' : 'text-text-primary'
        }`}
      >
        {t(`${edition.key}.name`)}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          edition.isCurrent ? 'text-white/80' : 'text-text-primary/60'
        }`}
      >
        {t(`${edition.key}.description`)}
      </p>
    </div>
  );
}
