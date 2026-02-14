import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { routing } from '@/i18n/routing';
import BlogPostContent from '@/components/blog/BlogPostContent';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of routing.locales) {
    const posts = getBlogPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} — Pablo The Garden`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(slug, locale);

  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Back link */}
      <BlogPostContent
        post={post}
        backLabel={t('back')}
        dateLabel={t('date', {
          date: new Date(post.date).toLocaleDateString(
            locale === 'it' ? 'it-IT' : 'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          ),
        })}
        tagsLabel={t('tags')}
      />
    </article>
  );
}
