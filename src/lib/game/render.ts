// =============================================================================
// Pablo's Garden Run — canvas renderer
// -----------------------------------------------------------------------------
// Draws the game state produced by `engine.ts` into a 2D context whose
// transform has already been set so that (0,0)–(worldW,worldH) maps to the full
// canvas (the React layer handles DPR + scale). Pure drawing: no input, no
// simulation. Theme = candy synthwave (electronic festival meets a garden).
//
// World dimensions come from the state (`worldW`/`worldH`/`parrotX`) so the same
// code renders both the normal 480×720 portrait game and the cinematic 32:9
// "showcase" (see `showcase.ts`). In normal play these equal the GAME constants,
// so output is byte-for-byte identical to before.
// =============================================================================

import { GAME, type GameState, type Gate, type Candy } from './engine';

const COLORS = {
  skyTop: '#150526',
  skyMid: '#241039',
  skyHorizon: '#3a1659',
  pink: '#FFCDFF',
  pinkDark: '#F4A9EC',
  orange: '#FFB347',
  blue: '#87CEEB',
  cyan: '#5CE1E6',
  mint: '#98FB98',
  bubblegum: '#DDA0DD',
  night: '#150526',
};

const CANDY_GLYPHS = ['🍬', '🍭', '🧁', '🍫'];

// -- deterministic star field (generated once per world width, client-side) ---

interface Star {
  x: number;
  y: number;
  r: number;
  tw: number;
}

const starCache = new Map<number, Star[]>();

function getStars(w: number, floorY: number): Star[] {
  const cached = starCache.get(w);
  if (cached) return cached;
  // Simple LCG so the field is stable across frames without per-frame random.
  let seed = 1337;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const out: Star[] = [];
  const count = Math.max(64, Math.round((w / 480) * 64));
  for (let i = 0; i < count; i++) {
    out.push({
      x: rng() * w,
      y: rng() * (floorY - 60),
      r: 0.6 + rng() * 1.8,
      tw: rng() * Math.PI * 2,
    });
  }
  starCache.set(w, out);
  return out;
}

// -- cached invariant gradients ----------------------------------------------
// These gradients use fixed logical coordinates + fixed colour stops, so they
// never change frame-to-frame. CanvasGradient coords are resolved against the
// CTM at *paint* time, not creation time, so a single cached object renders
// identically under the per-frame screen-shake / parrot transforms. Rebuilt only
// if the canvas context or the world width changes. Avoids ~5 allocations/frame
// and the matching GC churn on mobile.
let gradCtx: CanvasRenderingContext2D | null = null;
let gradW = -1;
let skyGrad: CanvasGradient | null = null;
let groundGrad: CanvasGradient | null = null;
let edgeGrad: CanvasGradient | null = null;
let parrotBodyGrad: CanvasGradient | null = null;
let parrotWingGrad: CanvasGradient | null = null;

function ensureGradients(ctx: CanvasRenderingContext2D, W: number, H: number, FLOOR: number): void {
  if (gradCtx === ctx && gradW === W && skyGrad) return;
  gradCtx = ctx;
  gradW = W;

  skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, COLORS.skyTop);
  skyGrad.addColorStop(0.55, COLORS.skyMid);
  skyGrad.addColorStop(1, COLORS.skyHorizon);

  groundGrad = ctx.createLinearGradient(0, FLOOR, 0, H);
  groundGrad.addColorStop(0, '#1d0838');
  groundGrad.addColorStop(1, '#0c0119');

  edgeGrad = ctx.createLinearGradient(0, 0, W, 0);
  edgeGrad.addColorStop(0, COLORS.cyan);
  edgeGrad.addColorStop(0.5, COLORS.pink);
  edgeGrad.addColorStop(1, COLORS.cyan);

  // Drawn in the parrot's local space (after translate), so local coords.
  parrotBodyGrad = ctx.createLinearGradient(0, -18, 0, 20);
  parrotBodyGrad.addColorStop(0, COLORS.pink);
  parrotBodyGrad.addColorStop(1, COLORS.pinkDark);

  parrotWingGrad = ctx.createLinearGradient(0, -4, 0, 24);
  parrotWingGrad.addColorStop(0, COLORS.bubblegum);
  parrotWingGrad.addColorStop(1, COLORS.blue);
}

// -- low-level helpers -------------------------------------------------------

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points = 5): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const ang = (Math.PI / points) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// -- background --------------------------------------------------------------

function drawBackground(ctx: CanvasRenderingContext2D, s: GameState): void {
  const W = s.worldW;
  const H = s.worldH;
  const FLOOR = H - GAME.GROUND_H;

  ctx.fillStyle = skyGrad!;
  ctx.fillRect(0, 0, W, H);

  // Stars
  const pulse = 0.5 + 0.5 * Math.sin(s.beat * Math.PI * 2);
  for (const st of getStars(W, FLOOR)) {
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(st.tw + s.beat * Math.PI * 2));
    ctx.globalAlpha = tw;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Disco moon — glowing orb, gently beating.
  const moonR = 46 + pulse * 4;
  ctx.save();
  ctx.shadowColor = COLORS.pink;
  ctx.shadowBlur = 24;
  const mg = ctx.createRadialGradient(W - 86, 92, 8, W - 86, 92, moonR);
  mg.addColorStop(0, '#FFE9FF');
  mg.addColorStop(0.6, COLORS.pink);
  mg.addColorStop(1, 'rgba(255,205,255,0.15)');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(W - 86, 92, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Disco facets
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = COLORS.bubblegum;
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(W - 86 - moonR, 92 + i * 16);
    ctx.lineTo(W - 86 + moonR, 92 + i * 16);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  drawSilhouettes(ctx, s);
}

// Parallax garden silhouettes (palms + candy bushes) along the horizon.
function drawSilhouettes(ctx: CanvasRenderingContext2D, s: GameState): void {
  const W = s.worldW;
  const baseY = s.worldH - GAME.GROUND_H;
  // Far layer
  ctx.fillStyle = 'rgba(20,5,38,0.85)';
  const off1 = (s.distance * 0.18) % 220;
  for (let i = -1; i < W / 220 + 1; i++) {
    const x = i * 220 - off1 + 60;
    palm(ctx, x, baseY, 0.8, 'rgba(58,22,89,0.9)');
  }
  // Near layer
  const off2 = (s.distance * 0.4) % 300;
  for (let i = -1; i < W / 300 + 1; i++) {
    const x = i * 300 - off2 + 200;
    palm(ctx, x, baseY, 1.1, 'rgba(36,16,57,0.95)');
  }
}

function palm(ctx: CanvasRenderingContext2D, x: number, baseY: number, scale: number, color: string): void {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  // trunk
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.quadraticCurveTo(2, -60, -2, -110);
  ctx.lineTo(8, -110);
  ctx.quadraticCurveTo(12, -60, 5, 0);
  ctx.closePath();
  ctx.fill();
  // fronds
  for (let a = 0; a < 5; a++) {
    const ang = -Math.PI / 2 + (a - 2) * 0.6;
    ctx.beginPath();
    ctx.moveTo(2, -110);
    ctx.quadraticCurveTo(
      2 + Math.cos(ang) * 34,
      -110 + Math.sin(ang) * 34,
      2 + Math.cos(ang) * 64,
      -110 + Math.sin(ang) * 64 + 10
    );
    ctx.quadraticCurveTo(2 + Math.cos(ang) * 34, -110 + Math.sin(ang) * 34 + 6, 2, -106);
    ctx.fill();
  }
  ctx.restore();
}

// -- ground: neon grid + equalizer -------------------------------------------

function drawGround(ctx: CanvasRenderingContext2D, s: GameState): void {
  const W = s.worldW;
  const H = s.worldH;
  const FLOOR = H - GAME.GROUND_H;

  // base strip
  ctx.fillStyle = groundGrad!;
  ctx.fillRect(0, FLOOR, W, GAME.GROUND_H);

  // neon perspective grid
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, FLOOR, W, GAME.GROUND_H);
  ctx.clip();
  ctx.strokeStyle = 'rgba(92,225,230,0.35)';
  ctx.lineWidth = 1.5;
  const vanishX = W / 2;
  // Vertical converging lines (central perspective fan). Enough lines that the
  // bottom spread (120 px pitch) always reaches both edges — 6 each side covers
  // the 480-wide portrait world exactly as before, the ultrawide band needs 12.
  const fanN = Math.max(6, Math.ceil(W / 2 / 120));
  for (let i = -fanN; i <= fanN; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishX + i * 18, FLOOR);
    ctx.lineTo(vanishX + i * 120, H);
    ctx.stroke();
  }
  // horizontal scrolling lines
  const scroll = (s.distance * 0.6) % 26;
  for (let yy = 0; yy < GAME.GROUND_H + 26; yy += 13) {
    const y = FLOOR + ((yy + scroll) % (GAME.GROUND_H + 26));
    const a = (y - FLOOR) / GAME.GROUND_H;
    ctx.globalAlpha = 0.15 + a * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // equalizer bars sitting on the horizon (density scales with width;
  // resolves to exactly 18 bars at the normal 480-wide world)
  const bars = Math.max(18, Math.round((W * 18) / 480));
  const bw = W / bars;
  for (let i = 0; i < bars; i++) {
    const phase = s.beat * Math.PI * 2 + i * 0.7;
    const amp = 6 + Math.abs(Math.sin(phase)) * (18 + Math.min(s.score, 30));
    const hgt = Math.min(amp, 60);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,205,255,0.5)' : 'rgba(92,225,230,0.5)';
    ctx.fillRect(i * bw + 2, FLOOR - hgt, bw - 4, hgt);
  }

  // neon top edge
  ctx.save();
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = edgeGrad!;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR);
  ctx.lineTo(W, FLOOR);
  ctx.stroke();
  ctx.restore();
}

// -- gates (neon speaker stacks) ---------------------------------------------

function drawGate(ctx: CanvasRenderingContext2D, g: Gate, s: GameState): void {
  const FLOOR = s.worldH - GAME.GROUND_H;
  const topH = g.gapY;
  const botY = g.gapY + g.gap;
  const botH = FLOOR - botY;
  const beat = 0.5 + 0.5 * Math.sin(s.beat * Math.PI * 2);
  const hueA = `hsl(${g.hue}, 90%, 72%)`;
  const hueB = `hsl(${(g.hue + 40) % 360}, 90%, 66%)`;

  const drawPillar = (y: number, h: number, dirDown: boolean) => {
    if (h <= 0) return;
    // body — no shadow: a dark body's drop-shadow over the dark sky is barely
    // visible yet is one of the priciest per-frame ops on mobile.
    const lg = ctx.createLinearGradient(g.x, 0, g.x + GAME.GATE_W, 0);
    lg.addColorStop(0, 'rgba(30,11,53,0.96)');
    lg.addColorStop(0.5, 'rgba(43,19,73,0.98)');
    lg.addColorStop(1, 'rgba(30,11,53,0.96)');
    ctx.fillStyle = lg;
    roundRect(ctx, g.x, y, GAME.GATE_W, h, 10);
    ctx.fill();
    // neon outline — the one glow we pay for on each pillar.
    ctx.save();
    ctx.shadowColor = hueA;
    ctx.shadowBlur = 12 + beat * 6;
    ctx.strokeStyle = hueA;
    ctx.lineWidth = 2.5;
    roundRect(ctx, g.x + 1.5, y + 1.5, GAME.GATE_W - 3, h - 3, 9);
    ctx.stroke();
    ctx.restore();

    // speaker cones at the gap-facing end
    const coneY = dirDown ? y + h - 22 : y + 22;
    ctx.save();
    ctx.fillStyle = hueB;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(g.x + GAME.GATE_W / 2, coneY, 13 + beat * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.night;
    ctx.beginPath();
    ctx.arc(g.x + GAME.GATE_W / 2, coneY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // rungs (speaker grille)
    ctx.strokeStyle = 'rgba(255,205,255,0.18)';
    ctx.lineWidth = 1;
    const step = 16;
    const from = dirDown ? y + 8 : y + 40;
    const to = dirDown ? y + h - 40 : y + h - 8;
    for (let yy = from; yy < to; yy += step) {
      ctx.beginPath();
      ctx.moveTo(g.x + 8, yy);
      ctx.lineTo(g.x + GAME.GATE_W - 8, yy);
      ctx.stroke();
    }
  };

  drawPillar(0, topH, false);
  drawPillar(botY, botH, true);

  // glowing gap rim (the "laser" the player threads)
  ctx.save();
  ctx.shadowColor = hueA;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = hueA;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(g.x + 4, topH);
  ctx.lineTo(g.x + GAME.GATE_W - 4, topH);
  ctx.moveTo(g.x + 4, botY);
  ctx.lineTo(g.x + GAME.GATE_W - 4, botY);
  ctx.stroke();
  ctx.restore();
}

// -- candies -----------------------------------------------------------------

function drawCandy(ctx: CanvasRenderingContext2D, c: Candy, s: GameState): void {
  if (c.collected) return;
  const beat = 0.5 + 0.5 * Math.sin(s.beat * Math.PI * 2 + c.phase);
  ctx.save();
  ctx.translate(c.x, c.y);
  // glow halo
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'rgba(255,205,255,0.5)';
  ctx.beginPath();
  ctx.arc(0, 0, GAME.CANDY_R + 4 + beat * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.rotate(Math.sin(c.phase + s.beat * 4) * 0.25);
  ctx.font = `${GAME.CANDY_R * 2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CANDY_GLYPHS[c.kind % CANDY_GLYPHS.length], 0, 1);
  ctx.restore();
}

// -- particles ---------------------------------------------------------------

function drawParticles(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const p of s.particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = a;
    if (p.kind === 2) {
      // drop star
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      star(ctx, 0, 0, p.size + 1);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 1) {
      // feather
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // spark
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// -- Pablo the parrot (DJ headphones) ----------------------------------------

function drawParrot(ctx: CanvasRenderingContext2D, s: GameState): void {
  const flap = s.flapAnim / 0.18; // 1 just after a flap → 0
  ctx.save();
  ctx.translate(s.parrotX, s.parrotY);
  ctx.rotate(s.rot);

  // motion glow
  ctx.save();
  ctx.shadowColor = COLORS.pink;
  ctx.shadowBlur = 12;

  // tail feathers (tropical)
  const tailCols = [COLORS.cyan, COLORS.mint, COLORS.bubblegum];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = tailCols[i];
    ctx.save();
    ctx.rotate((i - 1) * 0.28);
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.quadraticCurveTo(-34, 0, -42, (i - 1) * 5);
    ctx.quadraticCurveTo(-34, 8, -14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // body
  ctx.fillStyle = parrotBodyGrad!;
  ctx.beginPath();
  ctx.ellipse(-2, 2, 21, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // belly
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(2, 8, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // wing (flaps): pivots up right after a flap, settles down
  const wingAngle = -0.9 + (1 - flap) * 1.2;
  ctx.save();
  ctx.translate(-2, -2);
  ctx.rotate(wingAngle);
  ctx.fillStyle = parrotWingGrad!;
  ctx.beginPath();
  ctx.ellipse(2, 8, 11, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  // wing tip feathers
  ctx.fillStyle = COLORS.cyan;
  ctx.beginPath();
  ctx.ellipse(2, 20, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // head
  ctx.fillStyle = COLORS.pink;
  ctx.beginPath();
  ctx.arc(15, -8, 14, 0, Math.PI * 2);
  ctx.fill();

  // crest feathers
  ctx.fillStyle = COLORS.orange;
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(12, -20);
    ctx.rotate(-0.3 + i * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-2, -10);
    ctx.lineTo(3, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // beak
  ctx.fillStyle = COLORS.orange;
  ctx.beginPath();
  ctx.moveTo(27, -10);
  ctx.quadraticCurveTo(40, -7, 27, -1);
  ctx.quadraticCurveTo(26, -5, 27, -10);
  ctx.fill();
  // lower beak
  ctx.fillStyle = '#E8952F';
  ctx.beginPath();
  ctx.moveTo(27, -3);
  ctx.quadraticCurveTo(35, -3, 27, 1);
  ctx.fill();

  // cheek
  ctx.fillStyle = 'rgba(152,251,152,0.55)';
  ctx.beginPath();
  ctx.arc(16, -2, 4, 0, Math.PI * 2);
  ctx.fill();

  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(19, -10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.night;
  const look = Math.max(-1.5, Math.min(1.5, s.parrotVy / 400));
  ctx.beginPath();
  ctx.arc(20.5, -10 + look, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(21.5, -11.5 + look, 1, 0, Math.PI * 2);
  ctx.fill();

  // DJ headphones — electronic-music signature
  drawHeadphones(ctx, s);

  ctx.restore();
}

function drawHeadphones(ctx: CanvasRenderingContext2D, s: GameState): void {
  const beat = 0.5 + 0.5 * Math.sin(s.beat * Math.PI * 2);
  // band over the head
  ctx.strokeStyle = COLORS.night;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(15, -8, 16, Math.PI * 1.15, Math.PI * 1.95);
  ctx.stroke();
  // ear cup (near side)
  const cupX = 8;
  const cupY = -8;
  ctx.save();
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 6 + beat * 6;
  ctx.fillStyle = COLORS.night;
  ctx.beginPath();
  ctx.ellipse(cupX, cupY, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cupX, cupY, 6, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // tiny equalizer on the cup
  ctx.fillStyle = COLORS.pink;
  for (let i = 0; i < 3; i++) {
    const bh = 2 + Math.abs(Math.sin(s.beat * Math.PI * 2 + i)) * 5;
    ctx.fillRect(cupX - 3 + i * 3, cupY + 3 - bh, 1.6, bh);
  }
}

// -- Nyan-style rainbow trail (showcase) -------------------------------------

const NYAN_COLORS = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#2979FF', '#AA00FF'];

function drawTrail(ctx: CanvasRenderingContext2D, s: GameState): void {
  const tr = s.trail;
  if (tr.length < 2) return;
  const stripe = 5;
  const n = NYAN_COLORS.length;
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 8;
  for (let c = 0; c < n; c++) {
    const off = (c - (n - 1) / 2) * stripe;
    ctx.strokeStyle = NYAN_COLORS[c];
    ctx.shadowColor = NYAN_COLORS[c];
    ctx.lineWidth = stripe + 0.6;
    ctx.beginPath();
    for (let i = 0; i < tr.length; i++) {
      const t = tr[i];
      if (i === 0) ctx.moveTo(t.x, t.y + off);
      else ctx.lineTo(t.x, t.y + off);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  // twinkling sparkles like Nyan Cat
  ctx.fillStyle = '#fff';
  for (let i = 2; i < tr.length - 1; i += 9) {
    const t = tr[i];
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(s.beat * Math.PI * 2 + i);
    ctx.beginPath();
    ctx.arc(t.x, t.y + ((i % 3) - 1) * 10, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// -- rainbow portal (showcase finale) ----------------------------------------

function drawPortal(ctx: CanvasRenderingContext2D, s: GameState): void {
  const p = s.portal;
  if (!p || p.alpha <= 0.01) return;
  const r = p.r * p.grow;
  ctx.save();

  // rotating rainbow rim
  ctx.globalAlpha = p.alpha;
  ctx.shadowColor = `hsl(${p.hue % 360}, 100%, 65%)`;
  ctx.shadowBlur = 40;
  const segs = 24;
  const base = (p.hue * Math.PI) / 180;
  ctx.lineWidth = Math.max(6, r * 0.16);
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2 + base;
    const a1 = ((i + 1) / segs) * Math.PI * 2 + base;
    ctx.strokeStyle = `hsl(${(p.hue + (i / segs) * 360) % 360}, 100%, 62%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, a0, a1 + 0.03);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // bright swirling core
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
  g.addColorStop(0, `hsla(${(p.hue + 180) % 360}, 100%, 92%, ${p.alpha})`);
  g.addColorStop(0.45, `hsla(${p.hue % 360}, 100%, 70%, ${0.55 * p.alpha})`);
  g.addColorStop(1, `hsla(${(p.hue + 60) % 360}, 100%, 50%, 0)`);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();

  // big candy centrepiece (scales with the portal)
  const cand = Math.min(r * 1.05, s.worldH * 1.25);
  ctx.globalAlpha = p.alpha;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(Math.sin((p.hue * Math.PI) / 180) * 0.15);
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 16;
  ctx.font = `${cand}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍬', 0, 0);
  ctx.restore();

  // white entry flash
  if (p.flash > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = p.flash;
    const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.25);
    fg.addColorStop(0, 'rgba(255,255,255,0.9)');
    fg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 1.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// -- drop strobe overlay -----------------------------------------------------

function drawFlash(ctx: CanvasRenderingContext2D, s: GameState): void {
  if (s.flash <= 0.01) return;
  const W = s.worldW;
  const H = s.worldH;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = s.flash * 0.35;
  const fg = ctx.createLinearGradient(0, 0, W, H);
  fg.addColorStop(0, COLORS.pink);
  fg.addColorStop(1, COLORS.cyan);
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, W, H);
  // strobe bands
  ctx.globalAlpha = s.flash * 0.18;
  ctx.fillStyle = '#fff';
  const band = 40;
  const shift = (s.beat * band * 2) % (band * 2);
  for (let y = -band; y < H; y += band * 2) {
    ctx.fillRect(0, y + shift, W, band);
  }
  ctx.restore();
}

// -- fade-to-black (showcase finale) -----------------------------------------

function drawFadeToBlack(ctx: CanvasRenderingContext2D, s: GameState): void {
  if (s.fade <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, s.fade);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, s.worldW, s.worldH);
  ctx.restore();
}

// -- public entry ------------------------------------------------------------

/**
 * Render a full frame. Assumes the context transform already maps logical
 * coordinates to the canvas. Applies its own screen-shake offset.
 */
export function renderGame(ctx: CanvasRenderingContext2D, s: GameState): void {
  ensureGradients(ctx, s.worldW, s.worldH, s.worldH - GAME.GROUND_H);
  ctx.save();
  if (s.shake > 0.2) {
    const sh = s.shake;
    ctx.translate(
      Math.sin(s.t * 90 + s.beat * 50) * sh * 0.5,
      Math.cos(s.t * 80) * sh * 0.5
    );
  }

  drawBackground(ctx, s);
  drawGround(ctx, s);

  for (const g of s.gates) drawGate(ctx, g, s);
  for (const c of s.candyItems) drawCandy(ctx, c, s);

  if (s.trail.length > 1) drawTrail(ctx, s);
  if (s.portal) drawPortal(ctx, s);

  // particles behind + parrot on top
  drawParticles(ctx, s);
  drawParrot(ctx, s);

  drawFlash(ctx, s);
  drawFadeToBlack(ctx, s);
  ctx.restore();
}
