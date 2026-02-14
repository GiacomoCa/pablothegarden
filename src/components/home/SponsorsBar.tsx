'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { Sponsor } from '@/lib/types';

interface SponsorsBarProps {
  sponsors: Sponsor[];
}

export default function SponsorsBar({ sponsors }: SponsorsBarProps) {
  const t = useTranslations('sponsors');

  return (
    <section className="bg-soft-pink py-16 md:py-24" aria-label={t('title')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg text-text-primary/70">{t('subtitle')}</p>
        </div>

        {sponsors.length > 0 ? (
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-20 w-full max-w-[180px] items-center justify-center rounded-candy bg-surface p-4 shadow-candy transition-all duration-300 hover:shadow-candy-hover hover:-translate-y-1"
                title={sponsor.name}
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={140}
                  height={60}
                  className="max-h-12 w-auto object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-primary/50">
            {t('become_partner_description')}
          </p>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-pill bg-candy-pink px-6 py-3 font-semibold text-white shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover"
          >
            {t('become_partner')}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
