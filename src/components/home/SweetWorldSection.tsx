'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import type { SweetWorldContent } from '@/lib/types';
import MarkdownContent from '@/components/shared/MarkdownContent';

interface SweetWorldSectionProps {
  content: SweetWorldContent;
}

/**
 * "Sweet World" homepage section — introduces the visual universe of the Sweet
 * Edition: colors, scenography, atmosphere. Content (heading, subtitle, CTA,
 * teaser images and narrative) is sourced from `content/sweetworld/{locale}.md`.
 */
export default function SweetWorldSection({ content }: SweetWorldSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-soft-pink via-surface to-surface-elevated py-16 md:py-24"
      aria-label={content.heading}
    >
      {/* Decorative sprinkle blobs */}
      <div
        className="pointer-events-none absolute left-8 top-12 h-40 w-40 rounded-full bg-orange-cream/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-12 right-8 h-48 w-48 rounded-full bg-candy-pink/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-night-purple sm:text-4xl md:text-5xl">
            {content.heading}
          </h2>
          {content.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-lg text-text-primary/70">
              {content.subtitle}
            </p>
          )}
        </div>

        {content.images.length > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {content.images.map((src, index) => (
              <motion.div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-candy shadow-candy"
                whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </motion.div>
            ))}
          </div>
        )}

        {content.body && (
          <MarkdownContent
            content={content.body}
            className="mx-auto max-w-3xl text-center [&_p]:text-text-primary/80"
          />
        )}

        {content.ctaLabel && content.ctaUrl && (
          <div className="mt-10 text-center">
            <Link
              href={content.ctaUrl}
              className="inline-flex items-center justify-center rounded-pill bg-candy-pink px-8 py-4 text-base font-semibold text-white shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover sm:text-lg"
            >
              {content.ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
