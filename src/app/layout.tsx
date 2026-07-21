import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PROMO } from '@/lib/game/promo';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pablothegarden.com'),
  // The marketing build is a full copy of the site on a second domain: keep it
  // out of every index so it can't compete with pablothegarden.com. Tied to the
  // PROMO flag rather than to hosting config, so it is impossible to switch on
  // for the real site by accident. Inherited by every page (none set `robots`).
  ...(PROMO ? { robots: { index: false, follow: false, nocache: true } } : {}),
  openGraph: {
    siteName: 'Pablo The Garden',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pablo The Garden - Candy Edition 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// Since we have a `[locale]` dynamic segment, this root layout
// just passes children through. The actual HTML structure is in
// `[locale]/layout.tsx`.
export default function RootLayout({ children }: Props) {
  return children;
}
