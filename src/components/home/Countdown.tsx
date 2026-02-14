'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// August 15, 2026 at 18:00 CEST (UTC+2) = 16:00 UTC
const FESTIVAL_DATE = new Date('2026-08-15T16:00:00Z');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft | null {
  const now = new Date();
  const diff = FESTIVAL_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return null;
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-candy bg-white/10 shadow-candy backdrop-blur-sm sm:h-24 sm:w-24 md:h-28 md:w-28">
        <span className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium uppercase tracking-wider text-white/70 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const t = useTranslations('countdown');
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className="bg-night-purple py-16 md:py-24" aria-label={t('title')}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            {t('title')}
          </h2>
          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-6">
            {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
              <CountdownUnit key={unit} value={0} label={t(unit)} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!timeLeft) {
    return (
      <section className="bg-night-purple py-16 md:py-24" aria-label={t('title')}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-candy-pink sm:text-3xl md:text-4xl">
            {t('expired')}
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-night-purple py-16 md:py-24" aria-label={t('title')}>
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          {t('title')}
        </h2>

        <div
          className="mt-8 flex items-center justify-center gap-3 sm:gap-6"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          <CountdownUnit value={timeLeft.days} label={t('days')} />
          <span className="font-display text-2xl text-candy-pink sm:text-3xl" aria-hidden="true">
            :
          </span>
          <CountdownUnit value={timeLeft.hours} label={t('hours')} />
          <span className="font-display text-2xl text-candy-pink sm:text-3xl" aria-hidden="true">
            :
          </span>
          <CountdownUnit value={timeLeft.minutes} label={t('minutes')} />
          <span className="font-display text-2xl text-candy-pink sm:text-3xl" aria-hidden="true">
            :
          </span>
          <CountdownUnit value={timeLeft.seconds} label={t('seconds')} />
        </div>
      </div>
    </section>
  );
}
