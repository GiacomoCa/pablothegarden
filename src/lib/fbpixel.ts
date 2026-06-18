/**
 * Meta (Facebook) Pixel helpers.
 *
 * The pixel itself is loaded by `MetaPixel.tsx`, but only AFTER the user grants
 * cookie consent (see `AnalyticsConsent.tsx`). Every helper here therefore
 * no-ops gracefully when `window.fbq` is absent — i.e. when the visitor has not
 * consented — so call sites never need to guard the call themselves.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Dataset / Pixel ID, overridable via env, defaults to the production pixel. */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '2027280681194694';

/** Fire a standard Meta Pixel event. No-op until the pixel has loaded. */
export function trackPixel(event: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
}

/**
 * Fire an `InitiateCheckout` event — call when a visitor clicks through to the
 * external Clappit checkout for a ticket.
 */
export function trackInitiateCheckout(params?: {
  content_name?: string;
  value?: number;
  currency?: string;
}): void {
  trackPixel('InitiateCheckout', params);
}
