import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getRules } from '@/lib/content';
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

  return {
    title: t('rules_title'),
    description: t('rules_description'),
  };
}

export default async function RulesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'rules' });
  const rulesContent = getRules(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-orange-cream">{t('subtitle')}</p>
        <p className="mt-3 text-sm text-text-primary/50">
          {t('last_updated', { date: '2026-01-15' })}
        </p>
      </div>

      {/* Rules content */}
      <div className="rounded-candy bg-surface-elevated p-6 shadow-candy sm:p-10">
        <MarkdownContent content={rulesContent} />
      </div>
    </div>
  );
}
