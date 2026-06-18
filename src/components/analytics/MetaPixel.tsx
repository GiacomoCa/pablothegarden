'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { META_PIXEL_ID } from '@/lib/fbpixel';

/**
 * Meta (Facebook) Pixel loader. Rendered ONLY after the user accepts the cookie
 * banner (mounted by `AnalyticsConsent.tsx`), so the pixel never loads without
 * consent.
 *
 * Tracks `PageView` (here) and `InitiateCheckout` (fired from the ticket buy
 * CTAs via `trackInitiateCheckout`). The init snippet sends the first PageView;
 * the effect below re-sends it on client-side route changes (App Router
 * navigations don't trigger a fresh script load).
 */
export default function MetaPixel() {
  const pathname = usePathname();
  // The init snippet already sends a PageView on mount, so skip the first run.
  const initialised = useRef(false);

  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      return;
    }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
