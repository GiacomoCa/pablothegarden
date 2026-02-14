import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLineupConfig, getLineup, getSponsors } from '@/lib/content';
import { routing } from '@/i18n/routing';
import Hero from '@/components/home/Hero';
import Countdown from '@/components/home/Countdown';
import LineupPreview from '@/components/home/LineupPreview';
import ExperienceCards from '@/components/home/ExperienceCards';
import EditionTimeline from '@/components/home/EditionTimeline';
import SponsorsBar from '@/components/home/SponsorsBar';
import InstagramFeed from '@/components/home/InstagramFeed';
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

  const title = t('home_title');
  const description = t('home_description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: 'Pablo The Garden',
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
    },
    alternates: {
      languages: {
        it: '/it',
        en: '/en',
      },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load all content at build time
  const lineupConfig = getLineupConfig();
  const artists = getLineup();
  const sponsors = getSponsors();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: 'Pablo The Garden - Sweet Edition 2026',
    startDate: '2026-08-15T18:00:00+02:00',
    endDate: '2026-08-17T04:00:00+02:00',
    location: {
      '@type': 'Place',
      name: 'Pablo The Garden',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Morrovalle',
        addressRegion: 'MC',
        addressCountry: 'IT',
      },
    },
    description:
      locale === 'it'
        ? 'Festival di musica elettronica a Morrovalle. Sweet Edition 2026.'
        : 'Electronic music festival in Morrovalle. Sweet Edition 2026.',
    url: 'https://pablothegarden.com',
    organizer: {
      '@type': 'Organization',
      name: 'Pablo The Garden',
    },
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ScrollReveal>
        <Countdown />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <LineupPreview config={lineupConfig} artists={artists} />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <ExperienceCards />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <EditionTimeline />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <SponsorsBar sponsors={sponsors} />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <InstagramFeed />
      </ScrollReveal>
    </>
  );
}
