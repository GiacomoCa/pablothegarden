import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGallery } from '@/lib/content';
import { routing } from '@/i18n/routing';
import GalleryGrid from '@/components/gallery/GalleryGrid';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('gallery_title'),
    description: t('gallery_description'),
  };
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'gallery' });
  const editions = getGallery();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-10 text-center sm:mb-14">
        <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-orange-cream">{t('subtitle')}</p>
      </div>

      {/* Gallery content */}
      <GalleryGrid editions={editions} />
    </section>
  );
}
