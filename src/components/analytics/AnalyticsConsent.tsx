'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import MetaPixel from './MetaPixel';

// Measurement ID — overridable via NEXT_PUBLIC_GA_ID, defaults to the GA4
// property. If empty, no banner is shown and no analytics load.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-JJYQC40PT1';
const STORAGE_KEY = 'pablo-cookie-consent';

type Consent = 'granted' | 'denied' | null;

/**
 * GDPR-compliant analytics: Google Analytics is loaded ONLY after the user
 * explicitly accepts via the cookie banner (prior blocking). Choice is stored
 * in localStorage so the banner doesn't reappear.
 */
export default function AnalyticsConsent() {
  const t = useTranslations('cookie');
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') setConsent(stored);
  }, []);

  // Nothing to do if analytics isn't configured, or before hydration.
  if (!GA_ID || !mounted) return null;

  const choose = (value: 'granted' | 'denied') => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === 'granted' && (
        <>
          <GoogleAnalytics gaId={GA_ID} />
          <MetaPixel />
        </>
      )}

      {consent === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-surface-elevated/95 px-4 py-4 backdrop-blur-md sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-text-primary/80">
              {t('message')}{' '}
              <Link
                href="/privacy"
                className="font-semibold text-candy-pink underline underline-offset-2 hover:text-candy-pink-dark"
              >
                {t('learn_more')}
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose('denied')}
                className="rounded-pill border border-white/20 px-5 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-white/10"
              >
                {t('reject')}
              </button>
              <button
                type="button"
                onClick={() => choose('granted')}
                className="rounded-pill bg-candy-pink px-5 py-2 text-sm font-semibold text-night-purple shadow-candy transition-colors hover:bg-candy-pink-dark"
              >
                {t('accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
