'use client';

import { motion } from 'framer-motion';
import { markdownToHtml } from '@/lib/markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
  animate?: boolean;
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Renders markdown content as styled HTML prose.
 * Optionally wraps in a Framer Motion container for scroll-triggered animations.
 */
export default function MarkdownContent({
  content,
  className = '',
  animate = false,
}: MarkdownContentProps) {
  const html = markdownToHtml(content);

  const proseClasses = [
    // Base typography
    'prose-content',
    // Headings
    '[&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-night-purple [&_h1]:mt-10 [&_h1]:mb-4 sm:[&_h1]:text-4xl',
    '[&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-night-purple [&_h2]:mt-8 [&_h2]:mb-3 sm:[&_h2]:text-3xl',
    '[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-2 sm:[&_h3]:text-2xl',
    // Paragraphs
    '[&_p]:text-text-primary/80 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-base sm:[&_p]:text-lg',
    // Strong and emphasis
    '[&_strong]:text-text-primary [&_strong]:font-semibold',
    '[&_em]:italic',
    // Links
    '[&_a]:text-candy-pink [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:text-candy-pink-dark',
    // Lists
    '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2',
    '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2',
    '[&_li]:text-text-primary/80 [&_li]:text-base [&_li]:leading-relaxed sm:[&_li]:text-lg',
    // Horizontal rule
    '[&_hr]:my-8 [&_hr]:border-candy-pink/20',
    // Inline code
    '[&_code]:rounded [&_code]:bg-soft-pink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-candy-pink-dark',
    className,
  ].join(' ');

  if (animate) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeUpVariants}
        className={proseClasses}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      className={proseClasses}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
