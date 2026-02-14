import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAbout } from '@/lib/content';
import { routing } from '@/i18n/routing';
import AboutTimeline from '@/components/about/AboutTimeline';
import AboutContent from '@/components/about/AboutContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('about_title');
  const description = t('about_description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}/about`,
      siteName: 'Pablo The Garden',
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
    },
    alternates: {
      languages: {
        it: '/it/about',
        en: '/en/about',
      },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const markdownContent = getAbout(locale);

  // Split the markdown into sections based on top-level headings (# Heading)
  const sections = splitMarkdownSections(markdownContent);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-orange-cream">{t('subtitle')}</p>
      </div>

      {/* Story section */}
      <AboutContent
        storyContent={sections.story}
        teamContent={sections.team}
        missionContent={sections.mission}
      />

      {/* Edition Timeline */}
      <AboutTimeline />

      {/* Team section */}
      <section className="py-12 md:py-16">
        <AboutContent
          storyContent=""
          teamContent={sections.team}
          missionContent=""
          section="team"
        />
      </section>

      {/* Mission section */}
      <section className="py-12 md:py-16">
        <AboutContent
          storyContent=""
          teamContent=""
          missionContent={sections.mission}
          section="mission"
        />
      </section>
    </div>
  );
}

/**
 * Split the about markdown into named sections based on top-level headings.
 * We expect the following h1 sections in order:
 * 1. La Nostra Storia / Our Story
 * 2. Le Edizioni / The Editions (skipped — rendered by the timeline component)
 * 3. Il Team / The Team
 * 4. La Nostra Missione / Our Mission
 */
function splitMarkdownSections(markdown: string): {
  story: string;
  editions: string;
  team: string;
  mission: string;
} {
  // Split at top-level headings (# Heading), keeping the heading
  const parts = markdown.split(/(?=^# )/m);

  const sections = {
    story: '',
    editions: '',
    team: '',
    mission: '',
  };

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const firstLine = trimmed.split('\n')[0].toLowerCase();

    if (
      firstLine.includes('storia') ||
      firstLine.includes('story')
    ) {
      // Remove the h1 heading — we render our own via translations
      sections.story = removeFirstHeading(trimmed);
    } else if (
      firstLine.includes('edizioni') ||
      firstLine.includes('editions')
    ) {
      sections.editions = removeFirstHeading(trimmed);
    } else if (
      firstLine.includes('team')
    ) {
      sections.team = removeFirstHeading(trimmed);
    } else if (
      firstLine.includes('missione') ||
      firstLine.includes('mission')
    ) {
      sections.mission = removeFirstHeading(trimmed);
    }
  }

  return sections;
}

function removeFirstHeading(text: string): string {
  return text.replace(/^# .+\n+/, '').trim();
}
