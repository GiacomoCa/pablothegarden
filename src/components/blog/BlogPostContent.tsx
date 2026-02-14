'use client';

import { useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/types';
import ShareButtons from './ShareButtons';

interface BlogPostContentProps {
  post: BlogPost;
  backLabel: string;
  dateLabel: string;
  tagsLabel: string;
}

/**
 * Convert basic markdown to HTML.
 * Handles: headings (h1-h3), bold, italic, links, unordered lists, paragraphs, line breaks.
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities (except markdown syntax)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings (must be before paragraph handling)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered lists
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^- (.+)$/);
    if (listMatch) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }

      const trimmed = line.trim();
      // Skip empty lines or lines that are already wrapped in block elements
      if (trimmed === '') {
        result.push('');
      } else if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('</ul') ||
        trimmed.startsWith('<li')
      ) {
        result.push(line);
      } else {
        result.push(`<p>${trimmed}</p>`);
      }
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  // Clean up empty paragraphs
  return result
    .filter((line) => line !== '<p></p>')
    .join('\n');
}

export default function BlogPostContent({
  post,
  backLabel,
  dateLabel,
  tagsLabel,
}: BlogPostContentProps) {
  const contentHtml = useMemo(() => markdownToHtml(post.content), [post.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-candy-pink transition-colors hover:text-candy-pink-dark"
      >
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
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {backLabel}
      </Link>

      {/* Featured image */}
      <div className="mb-8 overflow-hidden rounded-candy">
        {post.image ? (
          <div
            className="aspect-[21/9] w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${post.image})` }}
            role="img"
            aria-label={post.title}
          />
        ) : (
          <div className="flex aspect-[21/9] w-full items-center justify-center bg-gradient-to-br from-candy-pink via-bubblegum to-orange-cream">
            <span className="text-7xl" aria-hidden="true">
              🍬
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl font-bold text-night-purple sm:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      {/* Meta: date */}
      <p className="mt-3 text-text-primary/50">{dateLabel}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-primary/60">
            {tagsLabel}:
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-pill bg-candy-pink/10 px-3 py-1 text-xs font-medium text-candy-pink"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <hr className="my-8 border-surface-elevated" />

      {/* Content */}
      <div
        className="blog-prose"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Divider */}
      <hr className="my-8 border-surface-elevated" />

      {/* Share buttons */}
      <ShareButtons title={post.title} slug={post.slug} />

      {/* Back to blog link at bottom */}
      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-pill bg-candy-pink px-6 py-3 font-semibold text-white shadow-candy transition-all duration-300 hover:bg-candy-pink-dark hover:shadow-candy-hover hover:scale-105"
        >
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
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {backLabel}
        </Link>
      </div>
    </motion.div>
  );
}
