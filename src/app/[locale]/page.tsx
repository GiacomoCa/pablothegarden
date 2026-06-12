import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getStats,
  getLineupByDay,
  getHomeTickets,
} from '@/lib/content';
import { routing } from '@/i18n/routing';
import Hero from '@/components/home/Hero';
import BrandTagline from '@/components/home/BrandTagline';
import Countdown from '@/components/home/Countdown';
import LineupSection from '@/components/home/LineupSection';
import TicketsSection from '@/components/home/TicketsSection';
import ExperienceCards from '@/components/home/ExperienceCards';
import EditionTimeline from '@/components/home/EditionTimeline';
import StatsCounter from '@/components/home/StatsCounter';
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
      images: ['/og-image.jpg'],
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
  const stats = getStats();
  const lineupDays = getLineupByDay();
  const homeTickets = getHomeTickets();

  const siteUrl = 'https://pablothegarden.com';
  const localeUrl = `${siteUrl}/${locale}`;

  const availabilityMap: Record<string, string> = {
    available: 'https://schema.org/InStock',
    sold_out: 'https://schema.org/SoldOut',
    coming_soon: 'https://schema.org/PreOrder',
  };

  // Ticket offers from the homepage ticket cards
  const offers = homeTickets
    .filter((tk) => typeof tk.price === 'number')
    .map((tk) => ({
      '@type': 'Offer',
      name: `${tk.title[locale as 'it' | 'en']} — ${tk.release[locale as 'it' | 'en']}`,
      price: tk.price,
      priceCurrency: 'EUR',
      availability: availabilityMap[tk.status] ?? 'https://schema.org/InStock',
      ...(tk.url ? { url: tk.url } : {}),
      validFrom: '2026-02-01T00:00:00+01:00',
    }));

  // Revealed artists as performers
  const performers = lineupDays
    .flatMap((d) => d.artists)
    .filter((a) => a.revealed)
    .map((a) => ({ '@type': 'PerformingGroup', name: a.name }));

  // JSON-LD structured data for SEO + AI answer engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MusicEvent',
        name: 'Pablo The Garden — Sweet Edition 2026',
        startDate: '2026-08-15T18:00:00+02:00',
        endDate: '2026-08-17T04:00:00+02:00',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        image: [`${siteUrl}/og-image.jpg`],
        url: localeUrl,
        description:
          locale === 'it'
            ? 'Pablo The Garden — Sweet Edition: festival di musica elettronica a Morrovalle (MC), 15–16 agosto 2026. DJ set, food & drink, fun zone e scenografie immersive a tema candy.'
            : 'Pablo The Garden — Sweet Edition: electronic music festival in Morrovalle (MC), Italy, 15–16 August 2026. DJ sets, food & drink, fun zone and immersive candy-themed scenography.',
        location: {
          '@type': 'Place',
          name: 'Pablo The Garden',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Morrovalle',
            addressRegion: 'MC',
            postalCode: '62010',
            addressCountry: 'IT',
          },
        },
        ...(performers.length > 0 ? { performer: performers } : {}),
        ...(offers.length > 0 ? { offers } : {}),
        organizer: {
          '@type': 'Organization',
          name: 'Pablo The Garden',
          url: siteUrl,
        },
      },
      {
        '@type': 'Organization',
        name: 'Pablo The Garden',
        url: siteUrl,
        logo: `${siteUrl}/images/logo/pablo.png`,
        sameAs: ['https://www.instagram.com/pablo_thegarden'],
      },
      {
        '@type': 'WebSite',
        name: 'Pablo The Garden',
        url: siteUrl,
        inLanguage: locale,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <BrandTagline />
      <ScrollReveal>
        <Countdown />
      </ScrollReveal>
      <div id="lineup" className="scroll-mt-20 md:scroll-mt-24">
        <ScrollReveal delay={0.1}>
          <LineupSection days={lineupDays} />
        </ScrollReveal>
      </div>
      <div id="tickets" className="scroll-mt-20 md:scroll-mt-24">
        <ScrollReveal delay={0.1}>
          <TicketsSection tickets={homeTickets} />
        </ScrollReveal>
      </div>
      <ScrollReveal delay={0.1}>
        <ExperienceCards />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <EditionTimeline />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <StatsCounter stats={stats} />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <InstagramFeed />
      </ScrollReveal>
    </>
  );
}
