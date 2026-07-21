'use client';

// Marketing build only: a pure-black, full-viewport block pinned to the very
// bottom of every page. The team scrolls to it and starts the screen recording
// on a clean black frame before scrolling back up into the site.
//
// Stacking is deliberately conditional. While the block *fills* the viewport it
// sits at z-index 90 — above every piece of fixed chrome (header 50, floating
// ticket CTA 40, cookie banner 60, Pablo 30) so the recording frame really is
// unbroken black, but below the mini-game modal (100), which must never be
// covered. The rest of the time it drops to the bottom of the stack: at z-90 a
// partially-scrolled block would also paint over the mobile nav drawer, the
// gallery lightbox and any other fixed overlay opened near the end of a page.
//
// "Fills the viewport" is detected with a 1px sentinel at the block's top edge:
// once that edge has passed above the top of the screen, the 105vh block covers
// everything below it.

import { useEffect, useRef, useState } from 'react';

export default function PromoBlackFrame() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [covering, setCovering] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setCovering(!entry.isIntersecting && entry.boundingClientRect.top <= 0),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      id="recording-start"
      aria-hidden="true"
      style={{
        position: 'relative',
        zIndex: covering ? 90 : 0,
        flexShrink: 0,
        width: '100%',
        // Slightly over one screen so scrolling to the bottom is guaranteed to
        // land on black with nothing peeking in from above.
        height: '105vh',
        background: '#000',
      }}
    >
      <div
        ref={sentinelRef}
        style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1 }}
      />
    </div>
  );
}
