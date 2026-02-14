import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Fredoka, DM_Sans } from 'next/font/google';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingTicketCTAWrapper from '@/components/layout/FloatingTicketCTAWrapper';
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

  return (
    <html lang={locale} className={`${fredoka.variable} ${dmSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main id="main-content" className="flex-1 pt-16 pb-20 md:pt-20 md:pb-6">
            {children}
          </main>
          <Footer />
          <FloatingTicketCTAWrapper />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
