import { setRequestLocale } from 'next-intl/server';
import { getLineupConfig, getLineup, getSponsors } from '@/lib/content';
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load all content at build time
  const lineupConfig = getLineupConfig();
  const artists = getLineup();
  const sponsors = getSponsors();

  return (
    <>
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
