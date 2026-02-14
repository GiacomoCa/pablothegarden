'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('accessibility');
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'it' ? 'en' : 'it';

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: otherLocale });
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={t('language_switch')}
      className={`
        relative flex items-center rounded-pill
        border-2 border-candy-pink/30 bg-surface
        text-sm font-medium transition-all duration-200
        hover:border-candy-pink hover:shadow-candy
        disabled:opacity-60 disabled:cursor-wait
        ${className}
      `}
    >
      <span
        className={`
          px-3 py-1.5 rounded-pill transition-all duration-200
          ${locale === 'it' ? 'bg-candy-pink text-white' : 'text-text-primary'}
        `}
      >
        IT
      </span>
      <span
        className={`
          px-3 py-1.5 rounded-pill transition-all duration-200
          ${locale === 'en' ? 'bg-candy-pink text-white' : 'text-text-primary'}
        `}
      >
        EN
      </span>
    </button>
  );
}
