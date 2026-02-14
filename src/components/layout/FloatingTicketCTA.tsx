'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import TicketSelectorModal from '@/components/tickets/TicketSelectorModal';
import type { TicketConfig } from '@/lib/types';

interface FloatingTicketCTAProps {
  ticketConfig: TicketConfig;
}

export default function FloatingTicketCTA({ ticketConfig }: FloatingTicketCTAProps) {
  const t = useTranslations('tickets');
  const tA11y = useTranslations('accessibility');
  const [modalOpen, setModalOpen] = useState(false);

  // Check if all tickets are sold out across all releases
  const allSoldOut = Object.values(ticketConfig.releases).every(
    (release) => release.status === 'sold_out'
  );

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', damping: 20, stiffness: 200 }}
        className="
          fixed z-40
          bottom-4 left-1/2 -translate-x-1/2
          md:bottom-6 md:left-auto md:right-6 md:translate-x-0
        "
      >
        <button
          onClick={() => !allSoldOut && setModalOpen(true)}
          disabled={allSoldOut}
          aria-label={tA11y('open_ticket_modal')}
          className={`
            group relative flex items-center gap-2
            rounded-pill px-6 py-3
            font-semibold text-white shadow-candy
            transition-all duration-300
            ${
              allSoldOut
                ? 'cursor-not-allowed bg-gray-400 shadow-none'
                : 'bg-candy-pink hover:bg-candy-pink-dark hover:shadow-candy-hover hover:scale-105 active:scale-95'
            }
          `}
        >
          {/* Pulse ring for available state */}
          {!allSoldOut && (
            <span className="absolute inset-0 animate-ping rounded-pill bg-candy-pink/30" />
          )}

          {/* Ticket icon */}
          <svg
            className="relative h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
            />
          </svg>

          <span className="relative">
            {allSoldOut ? t('sold_out') : t('buy_now')}
          </span>
        </button>
      </motion.div>

      <TicketSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        ticketConfig={ticketConfig}
      />
    </>
  );
}
