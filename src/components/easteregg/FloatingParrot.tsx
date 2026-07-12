'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import PabloSprite from './PabloSprite';

interface FloatingParrotProps {
  onOpen: () => void;
}

// Roam the left/right margins only, so Pablo never parks over the centred
// primary CTAs (hero Tickets/Lineup, ticket cards) and steals their taps.
// Also avoids the fixed header (top) and the floating ticket CTA (bottom).
// Values are viewport-relative (vw / vh).
function randomPos(): { x: number; y: number } {
  const onLeft = Math.random() < 0.5;
  const x = onLeft
    ? 4 + Math.random() * 10 // 4–14vw  (left margin)
    : 74 + Math.random() * 9; // 74–83vw (right margin, kept clear of the edge)
  return { x, y: 16 + Math.random() * 46 }; // 16–62vh
}

export default function FloatingParrot({ onOpen }: FloatingParrotProps) {
  const t = useTranslations('game');
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState({ x: 8, y: 40 });
  const [hint, setHint] = useState(false);
  const [reduce, setReduce] = useState(false);

  // Detect reduced-motion preference (client-only to avoid hydration issues).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Spawn in after a delay so Pablo quietly turns up on his own once the
  // visitor has settled into the page.
  useEffect(() => {
    const appear = setTimeout(() => {
      setPos(randomPos());
      setVisible(true);
      setHint(true);
      // next frame → trigger the entrance transition
      requestAnimationFrame(() => setShown(true));
    }, 30000);
    return () => clearTimeout(appear);
  }, []);

  // Periodically fly to a new spot (unless the user prefers reduced motion).
  useEffect(() => {
    if (!visible || reduce) return;
    const move = setInterval(() => setPos(randomPos()), 9000);
    return () => clearInterval(move);
  }, [visible, reduce]);

  // Auto-dismiss the hint bubble.
  useEffect(() => {
    if (!hint) return;
    const tmo = setTimeout(() => setHint(false), 5000);
    return () => clearTimeout(tmo);
  }, [hint]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('open_aria')}
      className="group fixed z-30 flex h-14 w-14 select-none items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-candy-pink focus-visible:ring-offset-2 focus-visible:ring-offset-night-purple"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: 'none',
        left: `${pos.x}vw`,
        top: `${pos.y}vh`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'scale(1)' : 'scale(0.2)',
        transition: reduce
          ? 'opacity 0.5s ease, transform 0.5s ease'
          : 'left 2.4s ease-in-out, top 2.4s ease-in-out, opacity 0.5s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* glow */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-candy-pink/30 blur-md"
        aria-hidden="true"
      />
      {!reduce && (
        <span
          className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-candy-pink/20"
          aria-hidden="true"
        />
      )}

      {/* bobbing parrot (hover/active scale on an inner layer to avoid clashing
          with the bob transform) */}
      <span className="parrot-bob relative block h-14 w-14">
        <span className="block h-full w-full transition-transform duration-200 group-hover:scale-110 group-active:scale-90">
          <PabloSprite
            className="h-full w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
            title="Pablo"
          />
        </span>
      </span>

      {/* hint bubble */}
      {hint && (
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-candy-pink px-3 py-1 text-xs font-bold text-night-purple shadow-candy">
          {t('hint')}
        </span>
      )}
    </button>
  );
}
