'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import type { HomeTicket } from '@/lib/types';

interface TicketsSectionProps {
  tickets: HomeTicket[];
}

function TicketCard({ ticket }: { ticket: HomeTicket }) {
  const t = useTranslations('tickets_home');
  const locale = useLocale() as 'it' | 'en';
  const shouldReduceMotion = useReducedMotion();

  const isSoldOut = ticket.status === 'sold_out';
  const isComingSoon = ticket.status === 'coming_soon';
  const isAvailable = ticket.status === 'available';

  return (
    <motion.div
      className={`relative flex flex-col overflow-hidden rounded-candy bg-surface-elevated shadow-candy ${
        isSoldOut ? 'opacity-70' : ''
      }`}
      whileHover={shouldReduceMotion || !isAvailable ? {} : { y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full">
        {ticket.image && (
          <Image
            src={ticket.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover ${isSoldOut ? 'grayscale' : ''}`}
          />
        )}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-night-purple/50">
            <span className="-rotate-6 rounded-pill border-2 border-white bg-night-purple/80 px-5 py-1.5 font-display text-lg font-bold uppercase tracking-wider text-white">
              {t('sold_out')}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-candy-pink">
          {ticket.release[locale]}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-text-primary">
          {ticket.title[locale]}
        </h3>

        {typeof ticket.price === 'number' && (
          <p
            className={`mt-2 font-display text-2xl font-bold ${
              isSoldOut ? 'text-text-primary/40' : 'text-text-primary'
            }`}
          >
            €{ticket.price}
          </p>
        )}

        <div className="mt-4 flex-1" />

        {isAvailable && ticket.url && (
          <a
            href={ticket.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-pill bg-candy-pink px-6 py-3 font-semibold text-night-purple shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover"
          >
            {t('buy')} €{ticket.price}
          </a>
        )}
        {isSoldOut && (
          <span className="inline-flex items-center justify-center rounded-pill bg-white/10 px-6 py-3 font-semibold text-text-primary/50">
            {t('sold_out')}
          </span>
        )}
        {isComingSoon && (
          <span className="inline-flex items-center justify-center rounded-pill bg-white/10 px-6 py-3 font-semibold text-text-primary/60">
            {t('coming_soon')}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Homepage tickets section — 5 purchase cards across 2 rows:
 * row 1 = the two sold-out two-day passes (first & second release),
 * row 2 = third-release full pass + two single-day tickets.
 */
export default function TicketsSection({ tickets }: TicketsSectionProps) {
  const t = useTranslations('tickets_home');

  if (tickets.length === 0) return null;

  const row1 = tickets.filter((tk) => tk.row === 1);
  const row2 = tickets.filter((tk) => tk.row === 2);

  return (
    <section className="bg-night-purple py-16 md:py-24" aria-label={t('title')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-candy-pink sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        {row1.length > 0 && (
          <div className="mx-auto mb-6 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {row1.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {row2.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {row2.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
