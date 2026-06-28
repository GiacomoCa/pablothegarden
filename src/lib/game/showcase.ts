// =============================================================================
// Pablo's Garden Run — cinematic "showcase" mode
// -----------------------------------------------------------------------------
// A hands-off, non-interactive flythrough triggered by typing `pablo` on the
// game's start screen. The world is widened to an ultrawide 32:9 band and Pablo
// flies *fluidly and automatically* along a smooth spline that threads the centre
// of each neon speaker-gate — a showcase of the flying parrot rather than a test
// of skill. After ~15 s he reaches a round rainbow portal that grows, flashes and
// fades to black, handing off to the brand end-card in the React layer.
//
// This module deliberately bypasses gravity, collision and scoring: the real
// game in `engine.ts` is untouched. `stepGame` dispatches here whenever
// `state.mode === 'showcase'`.
// =============================================================================

import { GAME, burst, type GameState, type GameEvents, type Gate, type Candy } from './engine';

const ASPECT = 32 / 9;

/** Tunable showcase choreography (logical pixels, seconds). */
const SHOW = {
  PARROT_FRAC: 0.16, // parrot anchor as a fraction of the wide world width
  SPEED: 290, // world scroll speed (px/s)
  GAP: 232, // gate opening — purely visual here (no collision)
  SPACING: 372, // world px between consecutive gates
  LEAD: 560, // world px of clear runway before the first gate
  N_GATES: 10,
  PORTAL_GAP: 600, // world px from the last gate to the portal
  BAND_TOP: 96, // top of the parrot's vertical travel band
  BAND_BOTTOM_INSET: 80, // gap kept above the ground for the travel band
  PORTAL_R: 90, // portal base radius
  GROW_RATE: 2.4, // portal growth/s during the climax
  GROW_TO: 2.4, // climax grows the portal to this multiple, then fades
  FADE_GROW: 7, // portal growth/s during the fade
  FADE_S: 1.1, // seconds of fade-to-black
  PORTAL_FLASH_DECAY: 1.6, // white-flash decay/s after entry
} as const;

// Hand-tuned vertical weave for the gate gap-centres (0 = high, 1 = low).
const WEAVE = [0.5, 0.18, 0.78, 0.32, 0.86, 0.22, 0.62, 0.14, 0.72, 0.44];

interface PathPoint {
  /** Scroll distance at which the parrot should be at `y`. */
  d: number;
  y: number;
}

interface RunPlan {
  path: PathPoint[];
  dPortal: number;
}

// The active run's immutable plan. The game is a singleton modal, so a single
// module-level cache is sufficient (re-created on every `startShowcase`).
let run: RunPlan | null = null;

/** Uniform Catmull-Rom interpolation of the path's y at scroll distance `d`. */
function pathY(points: PathPoint[], d: number): number {
  const n = points.length;
  if (d <= points[0].d) return points[0].y;
  if (d >= points[n - 1].d) return points[n - 1].y;
  let i = 0;
  while (i < n - 1 && points[i + 1].d < d) i++;
  const p1 = points[i];
  const p2 = points[i + 1];
  const p0 = points[i - 1] ?? p1;
  const p3 = points[i + 2] ?? p2;
  const t = (d - p1.d) / (p2.d - p1.d || 1);
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  );
}

/**
 * Switch an existing state into showcase mode: widen the world, lay out the
 * authored gate weave + candies, build the flight spline and arm the portal.
 */
export function startShowcase(s: GameState): void {
  const W = Math.round(GAME.HEIGHT * ASPECT); // 2560 @ 720 tall → exact 32:9
  const H = GAME.HEIGHT;
  const floor = H - GAME.GROUND_H;
  const parrotX = Math.round(W * SHOW.PARROT_FRAC);

  const bandTop = SHOW.BAND_TOP + SHOW.GAP / 2;
  const bandBot = floor - SHOW.BAND_BOTTOM_INSET - SHOW.GAP / 2;

  const gates: Gate[] = [];
  const candies: Candy[] = [];
  const path: PathPoint[] = [{ d: 0, y: H * 0.42 }];

  for (let i = 0; i < SHOW.N_GATES; i++) {
    const worldX = parrotX + SHOW.LEAD + i * SHOW.SPACING;
    const center = bandTop + WEAVE[i % WEAVE.length] * (bandBot - bandTop);
    gates.push({
      x: worldX,
      gapY: center - SHOW.GAP / 2,
      gap: SHOW.GAP,
      passed: true, // never scored in the showcase
      hue: (i * 40) % 360,
    });
    candies.push({
      x: worldX + GAME.GATE_W / 2,
      y: center,
      baseY: center,
      collected: false,
      kind: i % 4,
      phase: i * 0.7,
    });
    path.push({ d: SHOW.LEAD + i * SHOW.SPACING, y: center });
  }

  const dPortal = SHOW.LEAD + (SHOW.N_GATES - 1) * SHOW.SPACING + SHOW.PORTAL_GAP;
  const portalY = H * 0.44;
  path.push({ d: dPortal, y: portalY });
  run = { path, dPortal };

  s.mode = 'showcase';
  s.worldW = W;
  s.worldH = H;
  s.parrotX = parrotX;
  s.gates = gates;
  s.candyItems = candies;
  s.particles = [];
  s.distance = 0;
  s.score = 0;
  s.candies = 0;
  s.showT = 0;
  s.showStage = 'fly';
  s.fade = 0;
  s.flash = 0;
  s.shake = 0;
  s.parrotY = path[0].y;
  s.parrotVy = 0;
  s.rot = 0;
  s.flapAnim = 0.12;
  s.portal = {
    x: parrotX + dPortal, // far off the right edge to begin with
    y: portalY,
    r: SHOW.PORTAL_R,
    grow: 1,
    alpha: 0,
    hue: 0,
    flash: 0,
  };
}

/**
 * Advance the showcase by `dt`. Cosmetic timers + particles are already stepped
 * by `stepGame` before dispatch; here we only do the scripted flight, candy
 * sparkle, portal arrival and finale. Returns `s.ev` (coin/drop drive audio).
 */
export function stepShowcase(s: GameState, dt: number): GameEvents {
  const p = s.portal;
  if (!run || !p) return s.ev;
  s.showT += dt;
  const W = s.worldW;

  // Continuous, rhythmic wing flap (overrides the decay applied in stepGame).
  s.flapAnim = 0.06 + 0.1 * (0.5 + 0.5 * Math.sin(s.showT * 16));

  if (s.showStage === 'fly') {
    const dx = SHOW.SPEED * dt;
    s.distance += dx;
    const d = s.distance;

    // Smooth eased flight through the gap-centres; tilt from the path slope.
    s.parrotY = pathY(run.path, d);
    const eps = 6;
    const slope = (pathY(run.path, d + eps) - pathY(run.path, d - eps)) / (2 * eps);
    const targetRot = Math.max(-0.5, Math.min(0.7, Math.atan((slope * SHOW.SPEED) / 360)));
    s.rot += (targetRot - s.rot) * Math.min(1, dt * 10);

    // Scroll gates; bob + auto-collect candies along the path.
    for (const g of s.gates) g.x -= dx;
    for (const c of s.candyItems) {
      if (c.collected) continue;
      c.x -= dx;
      c.phase += dt * 3;
      c.y = c.baseY + Math.sin(c.phase) * 5;
      if (Math.abs(c.x - s.parrotX) < 30 && Math.abs(c.y - s.parrotY) < 60) {
        c.collected = true;
        s.candies += 1;
        s.ev.coin += 1;
        burst(s, c.x, c.y, 7, 0, 220);
      }
    }

    // Portal scrolls in from the right, rainbow hue rotating, fading in on entry.
    p.x = s.parrotX + (run.dPortal - s.distance);
    p.hue = (p.hue + dt * 70) % 360;
    p.alpha = Math.max(0, Math.min(1, (W + p.r - p.x) / 360));

    // Arrival → climax: beat drop, strobe, big burst, portal starts to bloom.
    if (s.distance >= run.dPortal) {
      s.distance = run.dPortal;
      p.x = s.parrotX;
      s.parrotY = pathY(run.path, run.dPortal);
      s.showStage = 'climax';
      s.flash = 1; // reuse the existing drop-strobe overlay
      p.flash = 1;
      s.ev.drop = true; // tick → audio.drop()
      burst(s, s.parrotX, s.parrotY, 26, 2, 340);
    }
    return s.ev;
  }

  if (s.showStage === 'climax') {
    p.hue = (p.hue + dt * 140) % 360;
    p.flash = Math.max(0, p.flash - dt * SHOW.PORTAL_FLASH_DECAY);
    p.grow += dt * SHOW.GROW_RATE;
    s.parrotY += (p.y - s.parrotY) * Math.min(1, dt * 8); // pulled into the portal
    if (p.grow >= SHOW.GROW_TO) s.showStage = 'fade';
    return s.ev;
  }

  if (s.showStage === 'fade') {
    p.hue = (p.hue + dt * 160) % 360;
    p.grow += dt * SHOW.FADE_GROW;
    s.fade = Math.min(1, s.fade + dt / SHOW.FADE_S);
    if (s.fade >= 1) {
      s.fade = 1;
      s.showStage = 'done';
    }
    return s.ev;
  }

  // 'done' — hold on black until the React layer shows the end-card.
  s.fade = 1;
  return s.ev;
}
