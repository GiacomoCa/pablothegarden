'use client';

import { useTranslations } from 'next-intl';

export default function NewBadge() {
  const t = useTranslations('lineup');

  return (
    <span
      className="
        absolute -top-2 -right-2 z-10
        inline-flex items-center
        rounded-pill bg-candy-pink px-2.5 py-0.5
        text-xs font-semibold text-white
        shadow-candy
        animate-[glow-pulse_2s_ease-in-out_infinite]
      "
      aria-label={t('new_badge')}
    >
      {t('new_badge')}
    </span>
  );
}
