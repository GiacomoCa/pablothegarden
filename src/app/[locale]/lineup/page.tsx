import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLineupConfig, getLineup } from '@/lib/content';
import { routing } from '@/i18n/routing';
import LineupPhaseManager from '@/components/lineup/LineupPhaseManager';
import ScrollReveal from '@/components/shared/ScrollReveal';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('lineup_title');
  const description = t('lineup_description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}/lineup`,
      siteName: 'Pablo The Garden',
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
    },
    alternates: {
      languages: {
        it: '/it/lineup',
        en: '/en/lineup',
      },
    },
  };
}

export default async function LineupPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'lineup' });
  const config = getLineupConfig();
  const artists = getLineup();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <ScrollReveal>
        <div className="mb-10 text-center sm:mb-14">
          <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-lg text-orange-cream">{t('subtitle')}</p>
        </div>
      </ScrollReveal>

      {/* Phase-dependent content */}
      <ScrollReveal delay={0.15}>
        <LineupPhaseManager config={config} artists={artists} />
      </ScrollReveal>
    </section>
  );
}
