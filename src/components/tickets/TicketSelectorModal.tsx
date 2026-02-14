'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import type { TicketConfig, TicketType, Release } from '@/lib/types';

interface TicketSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketConfig: TicketConfig;
}

function TicketButton({
  ticket,
  locale,
}: {
  ticket: TicketType;
  locale: string;
}) {
  const t = useTranslations('tickets');
  const localeKey = locale as 'it' | 'en';

  if (ticket.status === 'sold_out') {
    return (
      <div className="flex items-center justify-between rounded-candy bg-gray-100 px-5 py-4 opacity-60">
        <div>
          <p className="font-medium text-text-primary">{ticket.label[localeKey]}</p>
          <p className="text-sm text-text-primary/60">
            {ticket.currency} {ticket.price.toFixed(2)}
          </p>
        </div>
        <span className="rounded-pill bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600">
          {t('sold_out')}
        </span>
      </div>
    );
  }

  if (ticket.status === 'coming_soon') {
    return (
      <div className="flex items-center justify-between rounded-candy bg-gray-50 px-5 py-4 opacity-70">
        <div>
          <p className="font-medium text-text-primary">{ticket.label[localeKey]}</p>
          <p className="text-sm text-text-primary/60">
            {ticket.currency} {ticket.price.toFixed(2)}
          </p>
        </div>
        <span className="rounded-pill bg-orange-cream/30 px-4 py-2 text-sm font-semibold text-orange-cream">
          {t('coming_soon')}
        </span>
      </div>
    );
  }

  return (
    <a
      href={ticket.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-candy bg-candy-pink/5 px-5 py-4 transition-all duration-200 hover:bg-candy-pink/10 hover:shadow-candy"
    >
      <div>
        <p className="font-medium text-text-primary">{ticket.label[localeKey]}</p>
        <p className="text-sm text-candy-pink font-semibold">
          {ticket.currency} {ticket.price.toFixed(2)}
        </p>
      </div>
      <span className="rounded-pill bg-candy-pink px-4 py-2 text-sm font-semibold text-white shadow-candy transition-all duration-200 hover:bg-candy-pink-dark hover:shadow-candy-hover">
        {t('buy_now')}
      </span>
    </a>
  );
}

export default function TicketSelectorModal({
  isOpen,
  onClose,
  ticketConfig,
}: TicketSelectorModalProps) {
  const t = useTranslations('tickets_modal');
  const tA11y = useTranslations('accessibility');
  const locale = useLocale();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Close on click outside
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  // Find the active release
  const activeReleaseKey = ticketConfig.activeRelease as keyof typeof ticketConfig.releases;
  const activeRelease: Release | undefined = ticketConfig.releases[activeReleaseKey];

  // Check if all tickets are sold out across all releases
  const allSoldOut = Object.values(ticketConfig.releases).every(
    (release) => release.status === 'sold_out'
  );

  // Check if everything is coming_soon
  const allComingSoon =
    !ticketConfig.activeRelease ||
    Object.values(ticketConfig.releases).every(
      (release) => release.status === 'coming_soon'
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[60] flex items-end justify-center md:items-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-night-purple/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="
              relative z-10 w-full max-w-lg
              rounded-t-[2rem] bg-surface p-6 pb-8 shadow-2xl
              md:rounded-[2rem] md:p-8
            "
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label={tA11y('close_modal')}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-text-primary/50 transition-colors hover:bg-candy-pink/10 hover:text-candy-pink"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Drag handle on mobile */}
            <div className="mb-4 flex justify-center md:hidden">
              <div className="h-1 w-10 rounded-full bg-text-primary/20" />
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl font-bold text-text-primary">
              {t('title')}
            </h2>
            <p className="mt-1 text-sm text-text-primary/60">
              {t('subtitle')}
            </p>

            {/* Content */}
            <div className="mt-6 space-y-3">
              {allSoldOut ? (
                <div className="rounded-candy bg-gray-50 p-6 text-center">
                  <p className="text-lg font-semibold text-text-primary">
                    {t('all_sold_out_message')}
                  </p>
                </div>
              ) : allComingSoon ? (
                <div className="rounded-candy bg-orange-cream/10 p-6 text-center">
                  <p className="text-lg font-semibold text-text-primary">
                    {t('coming_soon_message')}
                  </p>
                </div>
              ) : activeRelease ? (
                <>
                  <TicketButton
                    ticket={activeRelease.tickets.fullpass}
                    locale={locale}
                  />
                  <TicketButton
                    ticket={activeRelease.tickets.day1}
                    locale={locale}
                  />
                  <TicketButton
                    ticket={activeRelease.tickets.day2}
                    locale={locale}
                  />
                </>
              ) : null}
            </div>

            {/* Link to full tickets page */}
            <div className="mt-6 text-center">
              <Link
                href="/tickets"
                onClick={onClose}
                className="text-sm font-medium text-candy-pink transition-colors hover:text-candy-pink-dark"
              >
                {t('go_to_tickets_page')}
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
