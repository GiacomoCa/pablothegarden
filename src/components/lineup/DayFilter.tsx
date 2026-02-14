'use client';

import { useTranslations } from 'next-intl';

type DayFilterValue = 'all' | 1 | 2;

interface DayFilterProps {
  activeFilter: DayFilterValue;
  onFilterChange: (filter: DayFilterValue) => void;
}

export default function DayFilter({
  activeFilter,
  onFilterChange,
}: DayFilterProps) {
  const t = useTranslations('lineup');

  const filters: { value: DayFilterValue; label: string }[] = [
    { value: 'all', label: t('filter_all') },
    { value: 1, label: t('filter_day1') },
    { value: 2, label: t('filter_day2') },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3" role="tablist" aria-label={t('filter_all')}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <button
            key={String(filter.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(filter.value)}
            className={`
              rounded-pill px-4 py-2 text-sm font-medium
              transition-all duration-200
              sm:px-5 sm:py-2.5 sm:text-base
              ${
                isActive
                  ? 'bg-candy-pink text-white shadow-candy'
                  : 'bg-surface-elevated text-text-primary hover:bg-candy-pink/10 hover:text-candy-pink'
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
