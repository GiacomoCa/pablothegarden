'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryEdition, GalleryImage } from '@/lib/types';
import Lightbox from './Lightbox';

interface GalleryGridProps {
  editions: GalleryEdition[];
}

type FilterYear = 'all' | number;

export default function GalleryGrid({ editions }: GalleryGridProps) {
  const t = useTranslations('gallery');
  const [activeFilter, setActiveFilter] = useState<FilterYear>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filterTabs: { label: string; value: FilterYear }[] = [
    { label: t('filter_all'), value: 'all' },
    { label: t('filter_2023'), value: 2023 },
    { label: t('filter_2024'), value: 2024 },
    { label: t('filter_2025'), value: 2025 },
  ];

  const filteredImages: GalleryImage[] = useMemo(() => {
    if (activeFilter === 'all') {
      return editions
        .flatMap((ed) =>
          ed.images.map((img) => ({ ...img, edition: ed.year }))
        )
        .sort((a, b) => {
          if (a.edition !== b.edition) return b.edition - a.edition;
          return a.order - b.order;
        });
    }

    const edition = editions.find((ed) => ed.year === activeFilter);
    if (!edition) return [];

    return edition.images
      .map((img) => ({ ...img, edition: edition.year }))
      .sort((a, b) => a.order - b.order);
  }, [editions, activeFilter]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  }, [filteredImages.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  }, [filteredImages.length]);

  return (
    <>
      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10 sm:gap-3">
        {filterTabs.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-pill px-5 py-2.5 text-sm font-medium transition-all duration-300 sm:px-6 sm:py-2.5 sm:text-base ${
              activeFilter === tab.value
                ? 'bg-candy-pink text-white shadow-candy'
                : 'bg-surface-elevated text-text-primary hover:bg-candy-pink/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <p className="py-12 text-center text-lg text-text-primary/60">
          {t('no_photos')}
        </p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.button
                key={`${image.edition}-${image.src}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => openLightbox(index)}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-candy bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-candy-pink focus:ring-offset-2"
                aria-label={image.alt}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-night-purple/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-medium text-white drop-shadow">
                      {image.alt}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Instagram CTA */}
      <div className="mt-12 text-center sm:mt-16">
        <a
          href="https://instagram.com/pablo_thegarden"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-pill bg-gradient-to-r from-candy-pink to-orange-cream px-8 py-4 text-lg font-semibold text-white shadow-candy transition-all duration-300 hover:shadow-candy-hover hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          {t('cta')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={filteredImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onPrev={goToPrev}
        onNext={goToNext}
      />
    </>
  );
}
