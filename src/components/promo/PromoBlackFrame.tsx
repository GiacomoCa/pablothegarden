// Marketing build only: a pure-black, full-viewport block pinned to the very
// bottom of every page. The team scrolls to it and starts the screen recording
// on a clean black frame before scrolling back up into the site.
//
// z-index 90 puts it above every fixed chrome element — header (50), floating
// ticket CTA (40), cookie banner (60), Pablo (30) — so scrolling to the bottom
// really does give an unbroken black screen, while staying below the mini-game
// modal (100), which must never be covered.

export default function PromoBlackFrame() {
  return (
    <div
      id="recording-start"
      aria-hidden="true"
      style={{
        position: 'relative',
        zIndex: 90,
        flexShrink: 0,
        width: '100%',
        // Slightly over one screen so scrolling to the bottom is guaranteed to
        // land on black with nothing peeking in from above.
        height: '105vh',
        background: '#000',
      }}
    />
  );
}
