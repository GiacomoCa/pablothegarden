'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { TicketType } from '@/lib/types';

interface TicketCardProps {
  ticket: TicketType;
  locale: string;
  typeKey: 'fullpass' | 'day1' | 'day2';
}

export default function TicketCard({ ticket, locale, typeKey }: TicketCardProps) {
  const t = useTranslations('tickets');
  const tA11y = useTranslations('accessibility');
  const localeKey = locale as 'it' | 'en';

  const isAvailable = ticket.status === 'available';
  const isSoldOut = ticket.status === 'sold_out';
  const isComingSoon = ticket.status === 'coming_soon';

  // Determine which "includes" items to show
  const includes: string[] = [t('includes_entry')];
  if (typeKey === 'fullpass') {
    includes.push(t('includes_both_days'));
  }
  includes.push(t('includes_drink_card'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={
        isAvailable
          ? {
              scale: 1.02,
              boxShadow: '0 0 0 2px rgba(255, 107, 157, 0.4), 0 8px 30px rgba(255, 107, 157, 0.4)',
            }
          : {}
      }
      className={`
        relative flex flex-col overflow-hidden rounded-candy border-2 p-6
        transition-all duration-300
        ${
          isAvailable
            ? 'border-candy-pink/30 bg-gradient-to-br from-white via-soft-pink to-candy-pink/10 shadow-candy'
            : isSoldOut
              ? 'border-gray-200 bg-gray-50'
              : 'border-bubblegum/20 bg-soft-pink/50'
        }
      `}
    >
      {/* Sold out stamp */}
      {isSoldOut && (
        <div className="absolute top-4 right-4 rotate-12" aria-hidden="true">
          <span className="inline-block rounded-pill border-2 border-gray-400 px-3 py-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
            {t('sold_out')}
          </span>
        </div>
      )}

      {/* Coming soon badge */}
      {isComingSoon && (
        <div className="absolute top-4 right-4">
          <span className="inline-block rounded-pill bg-bubblegum/20 px-3 py-1 text-xs font-semibold text-bubblegum">
            {t('coming_soon')}
          </span>
        </div>
      )}

      {/* Ticket label */}
      <h3
        className={`font-display text-xl font-bold ${
          isSoldOut ? 'text-gray-400' : 'text-text-primary'
        }`}
      >
        {ticket.label[localeKey]}
      </h3>

      {/* Price */}
      <div className="mt-4">
        <span
          className={`font-display text-4xl font-bold ${
            isAvailable
              ? 'text-candy-pink'
              : isSoldOut
                ? 'text-gray-300 line-through'
                : 'text-text-primary/30 blur-[2px]'
          }`}
        >
          {ticket.price.toFixed(0)}&euro;
        </span>
      </div>

      {/* Includes list */}
      <ul className="mt-5 flex-1 space-y-2">
        {includes.map((item) => (
          <li
            key={item}
            className={`flex items-start gap-2 text-sm ${
              isSoldOut ? 'text-gray-400' : 'text-text-primary/70'
            }`}
          >
            <svg
              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                isSoldOut ? 'text-gray-300' : 'text-mint-green'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="mt-6">
        {isAvailable ? (
          <a
            href={ticket.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('buy_now')} — ${ticket.label[localeKey]} (${tA11y('external_link_notice')})`}
            className="group relative block w-full overflow-hidden rounded-pill bg-candy-pink py-3 text-center font-semibold text-white shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover hover:scale-[1.02]"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-candy-pink-dark/0 via-white/20 to-candy-pink-dark/0"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            />
            <span className="relative">{t('buy_now')}</span>
          </a>
        ) : isSoldOut ? (
          <div className="w-full rounded-pill bg-gray-200 py-3 text-center font-semibold text-gray-400">
            {t('sold_out')}
          </div>
        ) : (
          <div className="w-full rounded-pill bg-bubblegum/20 py-3 text-center font-semibold text-bubblegum/60">
            {t('coming_soon')}
          </div>
        )}
      </div>
    </motion.div>
  );
}
