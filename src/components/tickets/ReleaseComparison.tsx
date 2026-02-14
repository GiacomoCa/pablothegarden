'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { TicketConfig, Release } from '@/lib/types';

interface ReleaseComparisonProps {
  ticketConfig: TicketConfig;
  locale: string;
}

type ReleaseKey = 'earlybird' | 'promo' | 'regular';

const RELEASE_ORDER: ReleaseKey[] = ['earlybird', 'promo', 'regular'];

function PriceCell({
  price,
  status,
  isActiveColumn,
}: {
  price: number;
  status: string;
  isActiveColumn: boolean;
}) {
  if (status === 'sold_out') {
    return (
      <span className="text-gray-400 line-through">
        {price.toFixed(0)}&euro;
      </span>
    );
  }

  if (status === 'coming_soon') {
    return (
      <span className="text-text-primary/30 blur-[2px]">
        {price.toFixed(0)}&euro;
      </span>
    );
  }

  return (
    <span
      className={`font-bold ${
        isActiveColumn ? 'text-candy-pink' : 'text-text-primary'
      }`}
    >
      {price.toFixed(0)}&euro;
    </span>
  );
}

function StatusBadge({ release }: { release: Release }) {
  const t = useTranslations('tickets');

  if (release.status === 'sold_out') {
    return (
      <span className="inline-block rounded-pill bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
        {t('sold_out')}
      </span>
    );
  }
  if (release.status === 'active') {
    return (
      <span className="inline-block rounded-pill bg-candy-pink/10 px-3 py-1 text-xs font-semibold text-candy-pink">
        {t('available')}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-pill bg-bubblegum/10 px-3 py-1 text-xs font-semibold text-bubblegum">
      {t('coming_soon')}
    </span>
  );
}

export default function ReleaseComparison({
  ticketConfig,
  locale,
}: ReleaseComparisonProps) {
  const t = useTranslations('tickets');
  const localeKey = locale as 'it' | 'en';

  const rows = [
    { key: 'fullpass' as const, label: ticketConfig.releases.earlybird.tickets.fullpass.label[localeKey] },
    { key: 'day1' as const, label: ticketConfig.releases.earlybird.tickets.day1.label[localeKey] },
    { key: 'day2' as const, label: ticketConfig.releases.earlybird.tickets.day2.label[localeKey] },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="mb-2 text-center font-display text-2xl font-bold text-text-primary sm:text-3xl">
          {t('comparison_title')}
        </h2>
        <p className="mb-8 text-center text-text-primary/60">
          {t('comparison_description')}
        </p>

        {/* Scrollable table wrapper for mobile */}
        <div className="overflow-x-auto rounded-candy">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-medium text-text-primary/60">
                  &nbsp;
                </th>
                {RELEASE_ORDER.map((releaseKey) => {
                  const release = ticketConfig.releases[releaseKey];
                  const isActive = release.status === 'active';

                  return (
                    <th
                      key={releaseKey}
                      className={`p-4 text-center ${
                        isActive
                          ? 'rounded-t-candy bg-candy-pink/5'
                          : ''
                      }`}
                    >
                      <span
                        className={`font-display text-base font-bold sm:text-lg ${
                          isActive
                            ? 'text-candy-pink'
                            : release.status === 'sold_out'
                              ? 'text-gray-400'
                              : 'text-text-primary/60'
                        }`}
                      >
                        {release.label[localeKey]}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-gray-100">
                  <td className="p-4 text-sm font-medium text-text-primary/80">
                    {row.label}
                  </td>
                  {RELEASE_ORDER.map((releaseKey) => {
                    const release = ticketConfig.releases[releaseKey];
                    const ticket = release.tickets[row.key];
                    const isActive = release.status === 'active';

                    return (
                      <td
                        key={releaseKey}
                        className={`p-4 text-center text-lg font-semibold ${
                          isActive ? 'bg-candy-pink/5' : ''
                        }`}
                      >
                        <PriceCell
                          price={ticket.price}
                          status={ticket.status}
                          isActiveColumn={isActive}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Status row */}
              <tr className="border-t border-gray-100">
                <td className="p-4 text-sm font-medium text-text-primary/80">
                  Status
                </td>
                {RELEASE_ORDER.map((releaseKey) => {
                  const release = ticketConfig.releases[releaseKey];
                  const isActive = release.status === 'active';

                  return (
                    <td
                      key={releaseKey}
                      className={`p-4 text-center ${
                        isActive ? 'rounded-b-candy bg-candy-pink/5' : ''
                      }`}
                    >
                      <StatusBadge release={release} />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
