// =============================================================================
// Pablo's Garden Run — pure game engine
// -----------------------------------------------------------------------------
// A casual one-button flyer: a hybrid of Flappy Bird (gravity + flap to navigate
// vertical gaps) and the Chrome dino runner (auto-scroll with a steadily rising
// difficulty ramp). Pablo the parrot flies through the garden collecting candies
// and dodging neon "speaker gate" obstacles — an electronic-festival nod.
//
// This module is framework-agnostic and free of DOM / browser APIs so the game
// logic stays easy to reason about (and unit-test). Rendering lives in
// `render.ts`, audio in `audio.ts`, both consuming the state produced here.
//
// Coordinate space is a fixed logical 480×720 portrait box; the renderer scales
// it to fit the device. Difficulty is therefore identical on every screen.
// =============================================================================

import { stepShowcase } from './showcase';

/** Tunable game constants (logical pixels, seconds). */
export const GAME = {
  WIDTH: 480,
  HEIGHT: 720,

  // Ground / speaker-stack strip at the bottom (visual + collision floor).
  GROUND_H: 96,

  // Parrot
  PARROT_X: 132,
  PARROT_R: 19, // collision radius (a touch forgiving vs. the drawn sprite)

  // Physics
  GRAVITY: 1750, // px/s²
  FLAP_VELOCITY: -545, // px/s (negative = up)
  MAX_FALL: 820, // terminal velocity downwards

  // World scroll speed (Chrome-dino style ramp)
  START_SPEED: 245, // px/s
  MAX_SPEED: 480,
  SPEED_PER_SCORE: 5.2, // px/s added per point of score

  // Gates (Flappy-style top+bottom obstacle with a gap)
  GATE_W: 66,
  GATE_SPACING: 300, // horizontal distance (px) between consecutive gates
  GAP_START: 224,
  GAP_MIN: 152,
  GAP_PER_SCORE: 2.3, // gap shrink per point of score
  GATE_MARGIN: 64, // min distance of a gap edge from ceiling/ground

  // Candies (collectibles)
  CANDY_R: 15,

  // Pacing / feel
  DROP_EVERY: 10, // a "drop" (strobe + speed surge) every N points
  BPM: 128, // beat used for visual pulse sync

  // Particle cap (perf)
  MAX_PARTICLES: 90,
} as const;

export type Phase = 'ready' | 'playing' | 'dead';

export interface Gate {
  /** Left edge x in screen space (moves left each frame). */
  x: number;
  /** Top y of the gap. */
  gapY: number;
  /** Gap height. */
  gap: number;
  /** Has the parrot already passed (scored) this gate? */
  passed: boolean;
  /** Per-gate hue offset so neon colours vary down the run. */
  hue: number;
}

export interface Candy {
  x: number;
  y: number;
  /** Base y around which it gently bobs. */
  baseY: number;
  collected: boolean;
  /** Index into the candy glyph set (renderer decides the emoji). */
  kind: number;
  /** Bob phase. */
  phase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  /** 'spark' | 'feather' | 'note' */
  kind: number;
  /** Affected by gravity? */
  gravity: number;
}

/** Transient per-step events the UI/audio layer reacts to. */
export interface GameEvents {
  flap: boolean;
  coin: number;
  pass: number;
  drop: boolean;
  dead: boolean;
}

/** Normal playable game vs. the hands-off cinematic "showcase" (typed `pablo`). */
export type GameMode = 'normal' | 'showcase';

/** Stages of the showcase run (see `showcase.ts`). */
export type ShowStage = 'fly' | 'approach' | 'climax' | 'fade' | 'done';

/** Rainbow portal the parrot flies into at the end of the showcase. */
export interface Portal {
  /** Screen-space x of the centre (scrolls in from the right). */
  x: number;
  /** Screen-space y of the centre. */
  y: number;
  /** Base radius (logical px) before any climax growth. */
  r: number;
  /** Growth multiplier — 1 on arrival, balloons through climax + fade. */
  grow: number;
  /** Fade-in / overall opacity in [0,1]. */
  alpha: number;
  /** Rotating base hue driving the rainbow sweep. */
  hue: number;
  /** White flash burst in [0,1] at the moment the parrot enters. */
  flash: number;
}

export interface GameState {
  phase: Phase;
  t: number; // elapsed seconds of active play
  parrotY: number;
  parrotVy: number;
  /** Visual rotation (rad) derived from velocity, smoothed. */
  rot: number;
  /** Wing flap animation timer (counts down after each flap). */
  flapAnim: number;
  speed: number;
  distance: number; // total world px scrolled (flavour / parallax)
  score: number;
  candies: number;
  gates: Gate[];
  candyItems: Candy[];
  particles: Particle[];
  /** Beat phase in [0,1) advancing at BPM for visual pulse. */
  beat: number;
  /** Drop strobe intensity, decays to 0. */
  flash: number;
  /** Screen-shake magnitude, decays to 0. */
  shake: number;
  /** Next score threshold that triggers a drop. */
  nextDrop: number;
  /** Idle bob phase for the ready screen. */
  idle: number;
  ev: GameEvents;

  // -- showcase mode (cinematic autoplay; see `showcase.ts`) ------------------
  /** Which mode the simulation is running in. */
  mode: GameMode;
  /** Logical world width — 480 in normal play, ~2560 (32:9) in the showcase. */
  worldW: number;
  /** Logical world height — always 720 today (kept in state for the renderer). */
  worldH: number;
  /** Parrot's fixed screen-x anchor (132 normal; further left in the showcase). */
  parrotX: number;
  /** Elapsed showcase seconds. */
  showT: number;
  /** Current showcase stage. */
  showStage: ShowStage;
  /** Full-screen fade-to-black in [0,1] (showcase finale). */
  fade: number;
  /** The end portal, or null outside the showcase. */
  portal: Portal | null;
  /** Recent parrot positions (screen space) for the Nyan-style rainbow trail. */
  trail: { x: number; y: number }[];
}

function emptyEvents(): GameEvents {
  return { flap: false, coin: 0, pass: 0, drop: false, dead: false };
}

const PLAY_FLOOR = GAME.HEIGHT - GAME.GROUND_H;

export function createGame(): GameState {
  const s: GameState = {
    phase: 'ready',
    t: 0,
    parrotY: GAME.HEIGHT * 0.42,
    parrotVy: 0,
    rot: 0,
    flapAnim: 0,
    speed: GAME.START_SPEED,
    distance: 0,
    score: 0,
    candies: 0,
    gates: [],
    candyItems: [],
    particles: [],
    beat: 0,
    flash: 0,
    shake: 0,
    nextDrop: GAME.DROP_EVERY,
    idle: 0,
    ev: emptyEvents(),
    mode: 'normal',
    worldW: GAME.WIDTH,
    worldH: GAME.HEIGHT,
    parrotX: GAME.PARROT_X,
    showT: 0,
    showStage: 'fly',
    fade: 0,
    portal: null,
    trail: [],
  };
  return s;
}

/** Reset an existing state object in place (keeps references stable). */
export function resetGame(s: GameState): void {
  const fresh = createGame();
  Object.assign(s, fresh);
}

// -- helpers -----------------------------------------------------------------

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function currentGap(score: number): number {
  return Math.max(GAME.GAP_MIN, GAME.GAP_START - score * GAME.GAP_PER_SCORE);
}

function spawnGapY(gap: number): number {
  const min = GAME.GATE_MARGIN;
  const max = PLAY_FLOOR - GAME.GATE_MARGIN - gap;
  return rand(min, Math.max(min, max));
}

/** Circle (cx,cy,r) vs axis-aligned rect (rx,ry,rw,rh) overlap test. */
function circleRect(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy <= r * r;
}

function pushParticle(s: GameState, p: Particle): void {
  if (s.particles.length >= GAME.MAX_PARTICLES) s.particles.shift();
  s.particles.push(p);
}

const CANDY_COLORS = ['#FFCDFF', '#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#5CE1E6'];

export function burst(
  s: GameState,
  x: number,
  y: number,
  count: number,
  kind: number,
  speed: number
): void {
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(speed * 0.3, speed);
    pushParticle(s, {
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rand(0.4, 0.9),
      maxLife: 0.9,
      size: rand(3, 7),
      rot: rand(0, Math.PI * 2),
      vr: rand(-8, 8),
      color: CANDY_COLORS[(Math.random() * CANDY_COLORS.length) | 0],
      kind,
      gravity: kind === 1 ? 520 : 120, // feathers fall, sparks float
    });
  }
}

// -- spawning ----------------------------------------------------------------

function spawnGate(s: GameState, x: number): void {
  const gap = currentGap(s.score);
  const gapY = spawnGapY(gap);
  s.gates.push({ x, gapY, gap, passed: false, hue: rand(0, 360) });

  // One candy floating in the centre of the gap — rewards a clean line.
  s.candyItems.push({
    x: x + GAME.GATE_W / 2,
    y: gapY + gap / 2,
    baseY: gapY + gap / 2,
    collected: false,
    kind: (Math.random() * 4) | 0,
    phase: rand(0, Math.PI * 2),
  });

  // A small candy arc roughly midway to the next gate.
  if (Math.random() < 0.8) {
    const arcX = x + GAME.GATE_SPACING / 2;
    const arcY = rand(GAME.GATE_MARGIN + 30, PLAY_FLOOR - GAME.GATE_MARGIN - 30);
    const n = 3;
    for (let i = 0; i < n; i++) {
      const yy = arcY - Math.sin((i / (n - 1)) * Math.PI) * 46;
      s.candyItems.push({
        x: arcX + i * 34,
        y: yy,
        baseY: yy,
        collected: false,
        kind: (Math.random() * 4) | 0,
        phase: rand(0, Math.PI * 2),
      });
    }
  }
}

function ensureGates(s: GameState): void {
  if (s.gates.length === 0) {
    spawnGate(s, GAME.WIDTH + 120);
    return;
  }
  const last = s.gates[s.gates.length - 1];
  if (last.x <= GAME.WIDTH - GAME.GATE_SPACING) {
    spawnGate(s, last.x + GAME.GATE_SPACING);
  }
}

// -- input -------------------------------------------------------------------

function doFlap(s: GameState): void {
  s.parrotVy = GAME.FLAP_VELOCITY;
  s.flapAnim = 0.18;
  s.ev.flap = true;
  burst(s, GAME.PARROT_X - 12, s.parrotY + 8, 3, 1, 150);
}

/**
 * Single-action input. From `ready` it launches the run; while `playing` it
 * flaps. `dead` is a no-op here (restart is driven by the UI layer).
 */
export function input(s: GameState): void {
  if (s.phase === 'ready') {
    s.phase = 'playing';
    s.parrotVy = 0;
    ensureGates(s);
    doFlap(s);
  } else if (s.phase === 'playing') {
    doFlap(s);
  }
}

// -- simulation --------------------------------------------------------------

function integrate(s: GameState, dt: number): void {
  // Parrot physics
  s.parrotVy = Math.min(s.parrotVy + GAME.GRAVITY * dt, GAME.MAX_FALL);
  s.parrotY += s.parrotVy * dt;

  // Soft ceiling: bonk instead of die (more forgiving / casual).
  if (s.parrotY < GAME.PARROT_R) {
    s.parrotY = GAME.PARROT_R;
    if (s.parrotVy < 0) s.parrotVy = 0;
  }

  // Difficulty ramp
  s.speed = Math.min(GAME.MAX_SPEED, GAME.START_SPEED + s.score * GAME.SPEED_PER_SCORE);
  const dx = s.speed * dt;
  s.distance += dx;

  // Move + cull gates, award score on pass.
  for (const g of s.gates) {
    g.x -= dx;
    if (!g.passed && g.x + GAME.GATE_W < GAME.PARROT_X) {
      g.passed = true;
      s.score += 1;
      s.ev.pass += 1;
    }
  }
  if (s.gates.length && s.gates[0].x < -GAME.GATE_W - 4) s.gates.shift();
  ensureGates(s);

  // Move + cull candies, handle collection.
  for (const c of s.candyItems) {
    if (c.collected) continue;
    c.x -= dx;
    c.phase += dt * 3;
    c.y = c.baseY + Math.sin(c.phase) * 5;
    const ddx = c.x - GAME.PARROT_X;
    const ddy = c.y - s.parrotY;
    if (ddx * ddx + ddy * ddy <= (GAME.PARROT_R + GAME.CANDY_R) ** 2) {
      c.collected = true;
      s.score += 1;
      s.candies += 1;
      s.ev.coin += 1;
      burst(s, c.x, c.y, 7, 0, 220);
    }
  }
  // Drop collected/off-screen candies.
  s.candyItems = s.candyItems.filter((c) => !c.collected && c.x > -GAME.CANDY_R - 4);

  // Drop event(s) when crossing score thresholds.
  while (s.score >= s.nextDrop) {
    s.nextDrop += GAME.DROP_EVERY;
    s.flash = 1;
    s.shake = Math.max(s.shake, 10);
    s.ev.drop = true;
    burst(s, GAME.PARROT_X, s.parrotY, 10, 2, 260);
  }

  // Collision: gates + ground.
  let hit = false;
  for (const g of s.gates) {
    if (g.x > GAME.PARROT_X + GAME.PARROT_R || g.x + GAME.GATE_W < GAME.PARROT_X - GAME.PARROT_R) {
      continue;
    }
    const topH = g.gapY;
    const botY = g.gapY + g.gap;
    if (
      circleRect(GAME.PARROT_X, s.parrotY, GAME.PARROT_R, g.x, 0, GAME.GATE_W, topH) ||
      circleRect(GAME.PARROT_X, s.parrotY, GAME.PARROT_R, g.x, botY, GAME.GATE_W, PLAY_FLOOR - botY)
    ) {
      hit = true;
      break;
    }
  }
  if (s.parrotY + GAME.PARROT_R >= PLAY_FLOOR) {
    s.parrotY = PLAY_FLOOR - GAME.PARROT_R;
    hit = true;
  }

  if (hit) {
    s.phase = 'dead';
    s.ev.dead = true;
    s.shake = 18;
    burst(s, GAME.PARROT_X, s.parrotY, 16, 1, 300);
  }
}

function updateParticles(s: GameState, dt: number): void {
  for (const p of s.particles) {
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.life -= dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0);
}

/**
 * Advance the simulation by `dt` seconds. Uses a fixed sub-step so collision
 * stays robust regardless of frame rate. Mutates `s`; read `s.ev` afterwards
 * for the events that occurred during this call.
 */
export function stepGame(s: GameState, dt: number): GameEvents {
  s.ev = emptyEvents();

  // Always advance cosmetic timers so menus/particles animate.
  s.beat = (s.beat + dt * (GAME.BPM / 60)) % 1;
  s.flash = Math.max(0, s.flash - dt * 2.6);
  s.shake = Math.max(0, s.shake - dt * 40);
  s.flapAnim = Math.max(0, s.flapAnim - dt);
  updateParticles(s, dt);

  // Cinematic autoplay takes a completely separate path (no gravity/collision).
  if (s.mode === 'showcase') return stepShowcase(s, dt);

  if (s.phase === 'ready') {
    s.idle += dt;
    s.parrotY = GAME.HEIGHT * 0.42 + Math.sin(s.idle * 2.2) * 12;
    s.rot = Math.sin(s.idle * 2.2) * 0.12;
    return s.ev;
  }

  if (s.phase !== 'playing') {
    // 'dead' — let velocity carry the parrot down for a beat of drama.
    if (s.parrotY + GAME.PARROT_R < PLAY_FLOOR) {
      s.parrotVy = Math.min(s.parrotVy + GAME.GRAVITY * dt, GAME.MAX_FALL);
      s.parrotY = Math.min(s.parrotY + s.parrotVy * dt, PLAY_FLOOR - GAME.PARROT_R);
    }
    s.rot = Math.min(s.rot + dt * 6, Math.PI / 2);
    return s.ev;
  }

  s.t += dt;

  // Fixed sub-stepping (max ~120Hz) to avoid tunneling through thin gates.
  const STEP = 1 / 120;
  let remaining = Math.min(dt, 1 / 20); // clamp huge frames (tab refocus etc.)
  while (remaining > 0 && s.phase === 'playing') {
    const h = Math.min(STEP, remaining);
    integrate(s, h);
    remaining -= h;
  }

  // Smooth visual rotation from velocity.
  const target = Math.max(-0.5, Math.min(1.1, s.parrotVy / 620));
  s.rot += (target - s.rot) * Math.min(1, dt * 12);

  return s.ev;
}
