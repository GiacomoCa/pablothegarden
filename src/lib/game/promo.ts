// =============================================================================
// Promo / marketing build switches
// -----------------------------------------------------------------------------
// A single build-time flag (`NEXT_PUBLIC_PROMO_MODE=1`) turns the ordinary site
// into the "recording" build the marketing team uses to shoot promo footage:
//
//   * Pablo the parrot turns up after 40 s instead of 15 s.
//   * The mini-game is laid out as an ultrawide 4224×1092 band (≈3.868:1)
//     instead of the 2:3 portrait card — same physics, much wider field.
//   * A full-viewport pure-black block sits at the very bottom of every page,
//     used as the "start of recording" frame.
//
// With the flag unset (production) every export below collapses to the values
// the live site has always used, so behaviour is unchanged.
// =============================================================================

// Opt-in and fail-closed: only the exact string '1' turns the promo build on, so
// no build can accidentally ship the recording layout (black frame, ultrawide
// game, no analytics) to the public site. It is set as a build-time env var on
// the dedicated `pablothegarden-promo` Vercel project, and nowhere else.
// NOTE: NEXT_PUBLIC_* is inlined at build time — setting it as a runtime-only
// variable has no effect.
/** True in the marketing/recording build. */
export const PROMO = process.env.NEXT_PUBLIC_PROMO_MODE === '1';

/** Target capture resolution requested by the marketing team. */
export const PROMO_RES = { w: 4224, h: 1092 } as const;

/** 4224 / 1092 = 352/91 ≈ 3.8681 : 1 (wider than 32:9, which is 3.5556 : 1). */
export const PROMO_ASPECT = PROMO_RES.w / PROMO_RES.h;

/** Aspect the game canvas is laid out at (portrait card vs. ultrawide band). */
export const GAME_ASPECT = PROMO ? PROMO_ASPECT : 2 / 3;

/** How long after page load Pablo appears, in ms. */
export const PARROT_DELAY_MS = PROMO ? 40_000 : 15_000;

/**
 * Canvas backing-store cap. Recording gets scaled/upsampled downstream, so the
 * promo build renders at a higher device-pixel ratio for a crisper capture.
 */
export const MAX_DPR = PROMO ? 2.5 : 1.5;
