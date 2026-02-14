import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pablothegarden.com'),
  openGraph: {
    siteName: 'Pablo The Garden',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pablo The Garden - Sweet Edition 2026',
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
