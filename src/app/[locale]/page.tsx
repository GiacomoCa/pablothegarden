import { setRequestLocale } from 'next-intl/server';
import { getLineupConfig, getLineup, getSponsors } from '@/lib/content';
import Hero from '@/components/home/Hero';
import Countdown from '@/components/home/Countdown';
import LineupPreview from '@/components/home/LineupPreview';
import ExperienceCards from '@/components/home/ExperienceCards';
import EditionTimeline from '@/components/home/EditionTimeline';
import SponsorsBar from '@/components/home/SponsorsBar';
import InstagramFeed from '@/components/home/InstagramFeed';

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
      <Countdown />
      <LineupPreview config={lineupConfig} artists={artists} />
      <ExperienceCards />
      <EditionTimeline />
      <SponsorsBar sponsors={sponsors} />
      <InstagramFeed />
    </>
  );
}
