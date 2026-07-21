import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Fredoka, DM_Sans } from 'next/font/google';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingTicketCTAWrapper from '@/components/layout/FloatingTicketCTAWrapper';
import AnalyticsConsent from '@/components/analytics/AnalyticsConsent';
import ParrotEasterEgg from '@/components/easteregg/ParrotEasterEgg';
import PromoBlackFrame from '@/components/promo/PromoBlackFrame';
import { PROMO } from '@/lib/game/promo';
import '@/app/globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'it' | 'en')) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Provide all messages to the client side
  const messages = await getMessages();

  const chrome = (
    <>
      <Header />
      <main id="main-content" className="flex-1 pt-16 pb-20 md:pt-20 md:pb-6">
        {children}
      </main>
      <Footer />
      <FloatingTicketCTAWrapper />
      {/* No cookie banner in the marketing build: it has no analytics to
          consent to and would sit in the middle of every recording. */}
      {!PROMO && <AnalyticsConsent />}
      <ParrotEasterEgg />
    </>
  );

  return (
    <html lang={locale} className={`${fredoka.variable} ${dmSans.variable}`}>
      {/* In the marketing build the sticky-footer flex context moves to an inner
          wrapper, so the 105vh black recording frame is a sibling of the page
          rather than a flex item competing with `main`'s flex-1 — otherwise it
          eats the leftover space and bleeds into the first screen of short
          pages (blog, privacy, contact) on tall displays. */}
      <body className={PROMO ? 'min-h-screen' : 'flex min-h-screen flex-col'}>
        <NextIntlClientProvider messages={messages}>
          {PROMO ? <div className="flex min-h-screen flex-col">{chrome}</div> : chrome}
          {PROMO && <PromoBlackFrame />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
