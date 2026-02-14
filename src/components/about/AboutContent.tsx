'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import MarkdownContent from '@/components/shared/MarkdownContent';

interface AboutContentProps {
  storyContent: string;
  teamContent: string;
  missionContent: string;
  /** When set, renders only that single section (used for split rendering) */
  section?: 'story' | 'team' | 'mission';
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function AboutContent({
  storyContent,
  teamContent,
  missionContent,
  section,
}: AboutContentProps) {
  const t = useTranslations('about');

  // If a specific section is requested, render only that one
  if (section === 'team') {
    return (
      <SectionBlock title={t('team_title')} content={teamContent}>
        <p className="mb-4 text-lg italic text-text-primary/60">
          {t('team_description')}
        </p>
      </SectionBlock>
    );
  }

  if (section === 'mission') {
    return (
      <SectionBlock title={t('mission_title')} content={missionContent}>
        <p className="mb-4 text-lg italic text-text-primary/60">
          {t('mission_description')}
        </p>
      </SectionBlock>
    );
  }

  // Default: render only the story section (the full-page layout handles the rest)
  return (
    <SectionBlock title={t('story_title')} content={storyContent} />
  );
}

function SectionBlock({
  title,
  content,
  children,
}: {
  title: string;
  content: string;
  children?: React.ReactNode;
}) {
  if (!content && !children) return null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUpVariants}
    >
      <h2 className="mb-6 font-display text-3xl font-bold text-night-purple sm:text-4xl">
        {title}
      </h2>
      {children}
      {content && <MarkdownContent content={content} />}
    </motion.div>
  );
}
