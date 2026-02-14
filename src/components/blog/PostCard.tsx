'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/types';

interface PostCardProps {
  post: BlogPost;
  index: number;
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export default function PostCard({ post, index }: PostCardProps) {
  const t = useTranslations('blog');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group overflow-hidden rounded-candy bg-surface shadow-sm transition-shadow duration-300 hover:shadow-candy"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Featured image area */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {post.image ? (
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${post.image})` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-candy-pink via-bubblegum to-orange-cream transition-transform duration-500 group-hover:scale-105">
              <span className="text-5xl" aria-hidden="true">
                🍬
              </span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-night-purple/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill bg-candy-pink/10 px-3 py-0.5 text-xs font-medium text-candy-pink"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="font-display text-xl font-bold text-night-purple transition-colors duration-200 group-hover:text-candy-pink sm:text-2xl">
            {post.title}
          </h2>

          {/* Date and reading time */}
          <div className="mt-2 flex items-center gap-3 text-sm text-text-primary/50">
            <time dateTime={post.date}>
              {formatDate(post.date, post.locale)}
            </time>
            <span aria-hidden="true">·</span>
            <span>
              {t('minutes_read', {
                minutes: estimateReadingTime(post.content),
              })}
            </span>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-3 line-clamp-3 text-text-primary/70">
              {post.excerpt}
            </p>
          )}

          {/* Read more */}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-candy-pink transition-colors duration-200 group-hover:text-candy-pink-dark">
            {t('read_more')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
