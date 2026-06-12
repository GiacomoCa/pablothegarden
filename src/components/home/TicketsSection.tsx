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
      className="group relative flex aspect-[3/4] flex-col overflow-hidden rounded-candy shadow-candy"
      whileHover={shouldReduceMotion || !isAvailable ? {} : { y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Background artwork */}
      {ticket.image && (
        <Image
          src={ticket.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ${
            isSoldOut ? 'grayscale' : 'group-hover:scale-105'
          }`}
        />
      )}

      {/* Pink wash + bottom dark fade so the title pops */}
      <div
        className="absolute inset-0 bg-candy-pink/15"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-night-purple/95 via-night-purple/35 to-transparent"
        aria-hidden="true"
      />

      {/* Sold-out treatment */}
      {isSoldOut && (
        <>
          <div className="absolute inset-0 bg-night-purple/55" aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="-rotate-6 rounded-pill border-2 border-white bg-night-purple/80 px-6 py-2 font-display text-xl font-bold uppercase tracking-wider text-white shadow-candy">
              {t('sold_out')}
            </span>
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 mt-auto flex flex-col items-center p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-candy-pink drop-shadow">
          {ticket.release[locale]}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-white drop-shadow-md">
          {ticket.title[locale]}
        </h3>

        {typeof ticket.price === 'number' && (
          <p
            className={`mt-1 font-display text-2xl font-bold drop-shadow ${
              isSoldOut ? 'text-white/50' : 'text-white'
            }`}
          >
            €{ticket.price}
          </p>
        )}

        {isAvailable && ticket.url && (
          <a
            href={ticket.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-pill bg-candy-pink px-6 py-3 font-semibold text-night-purple shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover"
          >
            {t('buy')} €{ticket.price}
          </a>
        )}
        {isComingSoon && (
          <span className="mt-4 inline-flex items-center justify-center rounded-pill bg-white/15 px-6 py-3 font-semibold text-white/80">
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
          <div className="mx-auto mb-6 grid max-w-md grid-cols-1 gap-6 sm:max-w-2xl sm:grid-cols-2">
            {row1.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {row2.length > 0 && (
          <div className="mx-auto grid max-w-md grid-cols-1 gap-6 sm:max-w-2xl sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
            {row2.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
