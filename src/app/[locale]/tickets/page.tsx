import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getTickets, getFaq } from '@/lib/content';
import { routing } from '@/i18n/routing';
import type { Release } from '@/lib/types';
import ReleaseBanner from '@/components/tickets/ReleaseBanner';
import ReleaseSection from '@/components/tickets/ReleaseSection';
import ReleaseComparison from '@/components/tickets/ReleaseComparison';
import PracticalInfo from '@/components/tickets/PracticalInfo';
import FAQ from '@/components/tickets/FAQ';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('tickets_title'),
    description: t('tickets_description'),
  };
}

export default async function TicketsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ticketConfig = getTickets();
  const faqItems = getFaq(locale);

  // Determine the active release
  const activeReleaseKey = ticketConfig.activeRelease as keyof typeof ticketConfig.releases;
  const activeRelease: Release | undefined = ticketConfig.releases[activeReleaseKey];

  const t = await getTranslations({ locale, namespace: 'tickets' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-orange-cream">
          {t('subtitle')}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-text-primary/60">
          {t('description')}
        </p>
      </div>

      {/* Sections with vertical spacing */}
      <div className="space-y-16 sm:space-y-20">
        {/* 1. Release progress bar */}
        <ReleaseBanner ticketConfig={ticketConfig} locale={locale} />

        {/* 2. Active release ticket cards */}
        {activeRelease && (
          <ReleaseSection release={activeRelease} locale={locale} />
        )}

        {/* 3. Release comparison table */}
        <ReleaseComparison ticketConfig={ticketConfig} locale={locale} />

        {/* 4. Practical info */}
        <PracticalInfo />

        {/* 5. FAQ accordion */}
        <FAQ items={faqItems} />
      </div>
    </div>
  );
}
