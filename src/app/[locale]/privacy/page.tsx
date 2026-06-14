import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPrivacy } from '@/lib/content';
import { routing } from '@/i18n/routing';
import MarkdownContent from '@/components/shared/MarkdownContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('privacy_title');
  const description = t('privacy_description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}/privacy`,
      siteName: 'Pablo The Garden',
      images: ['/og-image.jpg'],
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
    },
    alternates: {
      languages: {
        it: '/it/privacy',
        en: '/en/privacy',
      },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'privacy' });
  const privacyContent = getPrivacy(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="font-display text-4xl font-bold text-candy-pink sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-orange-cream">{t('subtitle')}</p>
        <p className="mt-3 text-sm text-text-primary/50">
          {t('last_updated', { date: '2026-06-14' })}
        </p>
      </div>

      {/* Privacy content */}
      <div className="rounded-candy bg-surface-elevated p-6 shadow-candy sm:p-10">
        <MarkdownContent content={privacyContent} />
      </div>
    </div>
  );
}
