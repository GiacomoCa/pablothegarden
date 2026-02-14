'use client';

import { useTranslations } from 'next-intl';
import type { BlogPost } from '@/lib/types';
import PostCard from './PostCard';

interface PostListProps {
  posts: BlogPost[];
}

export default function PostList({ posts }: PostListProps) {
  const t = useTranslations('blog');

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="mb-4 block text-5xl" aria-hidden="true">
          📝
        </span>
        <p className="text-lg text-text-primary/60">{t('no_posts')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
      {posts.map((post, index) => (
        <PostCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}
