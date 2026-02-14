import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getBlogPosts } from '@/lib/content';
import { routing } from '@/i18n/routing';
import PostList from '@/components/blog/PostList';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('blog_title');
  const description = t('blog_description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}/blog`,
      siteName: 'Pablo The Garden',
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
    },
    alternates: {
      languages: {
        it: '/it/blog',
        en: '/en/blog',
      },
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = getBlogPosts(locale);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-10 text-center sm:mb-14">
        <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-orange-cream">{t('subtitle')}</p>
      </div>

      {/* Post list */}
      <PostList posts={posts} />
    </section>
  );
}
