'use client';

import { motion } from 'framer-motion';
import type { Release } from '@/lib/types';
import TicketCard from './TicketCard';

interface ReleaseSectionProps {
  release: Release;
  locale: string;
}

const TICKET_KEYS = ['fullpass', 'day1', 'day2'] as const;

export default function ReleaseSection({
  release,
  locale,
}: ReleaseSectionProps) {
  const localeKey = locale as 'it' | 'en';

  return (
    <section className="mx-auto w-full max-w-5xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8 text-center"
      >
        <h2 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
          {release.label[localeKey]}
        </h2>
        <p className="mt-2 text-text-primary/60">
          {release.description[localeKey]}
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TICKET_KEYS.map((key, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
          >
            <TicketCard
              ticket={release.tickets[key]}
              locale={locale}
              typeKey={key}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
