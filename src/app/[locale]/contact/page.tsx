import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import ContactForm from '@/components/contact/ContactForm';
import DirectContact from '@/components/contact/DirectContact';
import SponsorCTA from '@/components/contact/SponsorCTA';

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
    title: t('contact_title'),
    description: t('contact_description'),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Page header */}
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="font-display text-4xl font-bold text-night-purple sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-lg text-orange-cream">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
        {/* Contact Form — takes more space */}
        <div className="lg:col-span-3">
          <h2 className="mb-6 font-display text-2xl font-bold text-night-purple">
            {t('form_title')}
          </h2>
          <ContactForm />
        </div>

        {/* Sidebar: direct contact + sponsor CTA */}
        <div className="space-y-8 lg:col-span-2">
          <DirectContact />
          <SponsorCTA />
        </div>
      </div>
    </div>
  );
}
