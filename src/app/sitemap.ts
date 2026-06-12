import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pablothegarden.com';
  const locales = ['it', 'en'] as const;
  const staticPages = [
    '',
    '/lineup',
    '/tickets',
    '/gallery',
    '/blog',
    '/about',
    '/rules',
    '/contact',
  ];

  const currentDate = new Date();

  // Static pages for both locales, each declaring its hreflang alternates
  const staticEntries = staticPages.flatMap((page) => {
    const languages = {
      it: `${baseUrl}/it${page}`,
      en: `${baseUrl}/en${page}`,
    };
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : page === '/lineup' || page === '/tickets' ? 0.9 : 0.8,
      alternates: { languages },
    }));
  });

  // Blog posts for both locales
  const blogEntries = locales.flatMap((locale) => {
    const posts = getBlogPosts(locale);
    return posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  });

  return [...staticEntries, ...blogEntries];
}
