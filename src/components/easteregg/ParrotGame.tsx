'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import {
  createGame,
  resetGame,
  stepGame,
  input as flapInput,
  type GameState,
} from '@/lib/game/engine';
import { renderGame } from '@/lib/game/render';
import { startShowcase } from '@/lib/game/showcase';
import { GameAudio } from '@/lib/game/audio';
import {
  addScore,
  getBestScore,
  getLastName,
  getScores,
  isGlobalLeaderboard,
  MAX_NAME,
  primeSession,
  qualifies,
  sanitizeName,
  type ScoreEntry,
} from '@/lib/game/leaderboard';
import { MAX_DPR, PROMO, PROMO_ASPECT } from '@/lib/game/promo';
import PabloSprite from './PabloSprite';
import Leaderboard from './Leaderboard';
import ShowcaseEndCard from './ShowcaseEndCard';

interface ParrotGameProps {
  onClose: () => void;
}

interface Result {
  score: number;
  candies: number;
  isBest: boolean;
}

type View = 'none' | 'form' | 'gameover' | 'board';

const MUTE_KEY = 'pablo-parrot-muted';

function computeSize(mode: GameState['mode']): { w: number; h: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (mode === 'showcase' || PROMO) {
    // Full-width ultrawide band, letterboxed top/bottom: 32:9 for the cinematic,
    // or the 4224×1092 promo format (≈3.868:1) throughout the marketing build.
    const aspect = PROMO ? PROMO_ASPECT : 32 / 9;
    let w = vw;
    let h = w / aspect;
    if (h > vh) {
      h = vh;
      w = h * aspect;
    }
    return { w: Math.round(w), h: Math.round(h) };
  }
  const availW = Math.min(vw * 0.96, 460);
  const availH = vh * 0.93;
  let w = availW;
  let h = w * 1.5;
  if (h > availH) {
    h = availH;
    w = h / 1.5;
  }
  return { w: Math.round(w), h: Math.round(h) };
}

export default function ParrotGame({ onClose }: ParrotGameProps) {
  const t = useTranslations('game');
  const globalBoard = isGlobalLeaderboard();

  // --- React state (drives the overlay UI) ---
  const [phase, setPhase] = useState<GameState['phase']>('ready');
  const [view, setView] = useState<View>('none');
  const [result, setResult] = useState<Result | null>(null);
  const [best, setBest] = useState(0);
  const [board, setBoard] = useState<ScoreEntry[]>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [name, setName] = useState('');
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [boardLoading, setBoardLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [mode, setMode] = useState<GameState['mode']>('normal');
  const [showEndCard, setShowEndCard] = useState(false);
  const [boardFade, setBoardFade] = useState(false);

  // --- refs (read by the rAF loop / stable handlers without re-render) ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scoreElRef = useRef<HTMLSpanElement | null>(null);
  const boardScrollRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  if (stateRef.current === null) stateRef.current = createGame();
  const audioRef = useRef<GameAudio | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const restartLockRef = useRef(0);
  const formActiveRef = useRef(false);
  const mutedRef = useRef(false);
  const pausedRef = useRef(false);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const modeRef = useRef<GameState['mode']>('normal');
  const prevStageRef = useRef<GameState['showStage']>('fly');
  const seqRef = useRef('');
  const seqTimeRef = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // --- stable handlers (referenced by listeners set up once on mount) ---

  const requestClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  const handleInput = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase === 'dead') return;
    if (s.mode === 'showcase') return; // the cinematic is hands-off
    if (!audioRef.current) audioRef.current = new GameAudio();
    const a = audioRef.current;
    a.setMuted(mutedRef.current);
    if (s.phase === 'ready') {
      a.start();
      flapInput(s);
      a.flap();
      lastRef.current = performance.now();
      primeSession();
      setPhase('playing');
    } else {
      flapInput(s);
      a.flap();
    }
  }, []);

  const pauseGame = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== 'playing' || pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    audioRef.current?.suspend();
  }, []);

  const handleResume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    lastRef.current = performance.now();
    audioRef.current?.resume();
  }, []);

  const handleRestart = useCallback(() => {
    if (performance.now() < restartLockRef.current) return;
    const s = stateRef.current;
    if (!s) return;
    resetGame(s);
    formActiveRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setResult(null);
    setSubmitError(false);
    setHighlightIdx(-1);
    setView('none');
    setBest(getBestScore());
    if (scoreElRef.current) scoreElRef.current.textContent = '0';
    lastRef.current = performance.now();
    setPhase('ready');
  }, []);

  const enterShowcase = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    startShowcase(s);
    modeRef.current = 'showcase';
    prevStageRef.current = 'fly';
    setMode('showcase');
    setShowEndCard(false);
    setView('none');
    setPaused(false);
    pausedRef.current = false;
    const sz = computeSize('showcase');
    sizeRef.current = sz;
    setSize(sz);
    if (!audioRef.current) audioRef.current = new GameAudio();
    audioRef.current.setMuted(mutedRef.current);
    audioRef.current.start();
    lastRef.current = performance.now();
  }, []);

  // The 100-row board scrolls: show a fade at the bottom edge whenever there is
  // more list below the fold, so it's obvious the list continues.
  const updateBoardFade = useCallback(() => {
    const el = boardScrollRef.current;
    if (!el) return;
    setBoardFade(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  useEffect(() => {
    if (view === 'board') updateBoardFade();
  }, [view, board, boardLoading, updateBoardFade]);

  // --- non-stable handlers (used only in JSX; latest closure each render) ---

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    audioRef.current?.setMuted(next);
    try {
      window.localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  const openBoard = async () => {
    setHighlightIdx(-1);
    setView('board');
    setBoardLoading(true);
    try {
      setBoard(await getScores());
    } finally {
      setBoardLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      const updated = await addScore(name, result.score);
      const clean = sanitizeName(name) || 'Pablo';
      const idx = updated.findIndex((en) => en.score === result.score && en.name === clean);
      setBoard(updated);
      setHighlightIdx(idx);
      formActiveRef.current = false;
      setBest(getBestScore());
      setView('board');
    } catch {
      // Keep the form up so the player can retry (personal best is already saved).
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const skipForm = async () => {
    formActiveRef.current = false;
    setHighlightIdx(-1);
    setView('board');
    setBoardLoading(true);
    try {
      setBoard(await getScores());
    } finally {
      setBoardLoading(false);
    }
  };

  // --- setup: loop, listeners, sizing (runs once) ---
  useEffect(() => {
    // Element focused when the game opened, so focus can return to it on close.
    // (Often already gone — the parrot trigger unmounts — hence the fallback.)
    const opener = document.activeElement as HTMLElement | null;

    // restore mute preference
    let pref = false;
    try {
      pref = window.localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      /* ignore */
    }
    mutedRef.current = pref;
    setMuted(pref);
    setBest(getBestScore());

    // Warm the board cache so the leaderboard opens instantly and `qualifies`
    // checks against the real top-100 at game-over (global mode).
    let boardAlive = true;
    void getScores().then((b) => {
      if (boardAlive) setBoard(b);
    });
    // Prime a session token now (global mode) so even a short run can submit.
    primeSession();

    const applySize = () => {
      const sz = computeSize(modeRef.current);
      sizeRef.current = sz;
      setSize(sz);
    };
    applySize();

    // Lock background scroll. `globals.css` sets `html { overflow-x: hidden }`,
    // which makes the ROOT the viewport-defining element — body's overflow is
    // then no longer propagated to the viewport, so locking body alone leaves
    // the wheel scrolling the page behind the modal.
    const root = document.documentElement;
    const prevOverflow = document.body.style.overflow;
    const prevRootOverflow = root.style.overflow;
    document.body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';

    // Basic modal a11y: move focus into the dialog and mark the rest of the page
    // inert so keyboard / screen-reader focus can't escape behind the overlay.
    const inerted: HTMLElement[] = [];
    const dialogEl = dialogRef.current;
    for (const el of Array.from(document.body.children)) {
      if (el === dialogEl || !(el instanceof HTMLElement)) continue;
      if (el.getAttribute('aria-hidden') === 'true') continue;
      el.setAttribute('aria-hidden', 'true');
      el.inert = true;
      inerted.push(el);
    }
    dialogRef.current?.focus();

    const draw = () => {
      const cv = canvasRef.current;
      const s = stateRef.current;
      if (!cv || !s) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const { w, h } = sizeRef.current;
      if (w <= 0 || h <= 0) return;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (cv.width !== bw || cv.height !== bh) {
        cv.width = bw;
        cv.height = bh;
      }
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const scale = (w / s.worldW) * dpr;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      renderGame(ctx, s);
    };

    const onDeath = () => {
      const s = stateRef.current;
      if (!s) return;
      const prevBest = getBestScore();
      const isBest = s.score > prevBest && s.score > 0;
      const a = audioRef.current;
      if (a) {
        a.gameOver();
        a.stop();
      }
      const q = qualifies(s.score);
      formActiveRef.current = q;
      setResult({ score: s.score, candies: s.candies, isBest });
      setName(getLastName());
      setBest(Math.max(prevBest, s.score));
      setSubmitError(false);
      setView(q ? 'form' : 'gameover');
      setPhase('dead');
      restartLockRef.current = performance.now() + 650;
    };

    const tick = (nowTs: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const s = stateRef.current;
      if (!s) return;
      const last = lastRef.current || nowTs;
      let dt = (nowTs - last) / 1000;
      lastRef.current = nowTs;
      if (dt > 1 / 15) dt = 1 / 15;
      else if (dt < 0) dt = 0;

      if (pausedRef.current) {
        draw();
        return;
      }

      const prev = s.phase;
      const ev = stepGame(s, dt);
      const a = audioRef.current;
      if (a) {
        if (ev.coin > 0) a.coin();
        if (ev.drop) a.drop();
        if (ev.dead) a.hit();
      }
      if (s.mode === 'showcase') {
        // Hands-off cinematic: no scoring/leaderboard. Reveal the brand the
        // moment Pablo enters the portal so it fades in *together with* the
        // expansion; the music keeps playing under the end card.
        const stage = s.showStage;
        const before = prevStageRef.current;
        const isFinale = stage === 'climax' || stage === 'fade' || stage === 'done';
        const wasFinale = before === 'climax' || before === 'fade' || before === 'done';
        if (isFinale && !wasFinale) setShowEndCard(true);
        prevStageRef.current = stage;
      } else {
        if (scoreElRef.current) scoreElRef.current.textContent = String(s.score);
        if (prev !== 'dead' && s.phase === 'dead') onDeath();
      }
      draw();
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      // Focus sitting on one of the dialog's own controls (buttons/links): its
      // Space/Enter must trigger that control natively, not a flap/restart.
      const onControl =
        tag === 'BUTTON' ||
        tag === 'A' ||
        !!target?.closest('button, a, [role="button"]');

      // Trap Tab focus inside the dialog (background is also inert).
      if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (root) {
          const nodes = root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          const list = Array.from(nodes).filter((el) => el.offsetParent !== null);
          if (list.length > 0) {
            const first = list[0];
            const lastEl = list[list.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey && (active === first || !root.contains(active))) {
              e.preventDefault();
              lastEl.focus();
            } else if (!e.shiftKey && (active === lastEl || !root.contains(active))) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        return;
      }

      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') target?.blur();
        return;
      }
      const s = stateRef.current;
      if (!s) return;

      // Secret: type "pablo" quickly on the start screen to launch the
      // hands-off cinematic showcase (desktop / landscape only).
      if (modeRef.current === 'normal' && s.phase === 'ready' && /^[a-z]$/i.test(e.key)) {
        const now = performance.now();
        if (now - seqTimeRef.current > 1200) seqRef.current = '';
        seqTimeRef.current = now;
        seqRef.current = (seqRef.current + e.key.toLowerCase()).slice(-5);
        if (
          seqRef.current === 'pablo' &&
          window.innerWidth > window.innerHeight &&
          window.innerWidth >= 820
        ) {
          e.preventDefault();
          seqRef.current = '';
          enterShowcase();
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (s.phase === 'playing' && !pausedRef.current) pauseGame();
        else requestClose();
        return;
      }
      if (
        e.code === 'Space' ||
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W'
      ) {
        if (onControl) return; // let the focused button/link activate natively
        e.preventDefault();
        if (pausedRef.current) {
          handleResume();
          return;
        }
        if (s.phase === 'dead') {
          if (!formActiveRef.current) handleRestart();
          return;
        }
        handleInput();
        return;
      }
      if (e.key === 'Enter' && s.phase === 'dead' && !formActiveRef.current) {
        if (onControl) return; // let the focused button/link activate natively
        e.preventDefault();
        handleRestart();
      }
    };

    const onResize = () => applySize();
    const onVis = () => {
      const s = stateRef.current;
      if (document.hidden) {
        if (s && s.phase === 'playing' && !pausedRef.current) {
          pausedRef.current = true;
          setPaused(true);
          audioRef.current?.suspend();
        }
      } else {
        lastRef.current = performance.now();
        // Only resume audio if the game is actually live — never under a pause.
        if (s && s.phase === 'playing' && !pausedRef.current) {
          audioRef.current?.resume();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('visibilitychange', onVis);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      boardAlive = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.removeEventListener('visibilitychange', onVis);
      document.body.style.overflow = prevOverflow;
      root.style.overflow = prevRootOverflow;
      for (const el of inerted) {
        el.removeAttribute('aria-hidden');
        el.inert = false;
      }
      audioRef.current?.dispose();
      audioRef.current = null;

      // Return focus to the page so keyboard / screen-reader users aren't
      // stranded on <body> when the game closes — the parrot trigger unmounts
      // with the game, so fall back to the main landmark (WCAG 2.4.3).
      let restore: HTMLElement | null = opener && opener.isConnected ? opener : null;
      if (!restore) {
        const main = document.getElementById('main-content');
        if (main) {
          if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
          restore = main;
        }
      }
      restore?.focus({ preventScroll: true });
    };
  }, [handleInput, handleRestart, handleResume, pauseGame, requestClose, enterShowcase]);

  const onField = (e: React.PointerEvent) => {
    e.preventDefault();
    if (pausedRef.current) handleResume();
    else handleInput();
  };

  if (typeof document === 'undefined') return null;

  const showField =
    mode === 'normal' && (phase === 'ready' || phase === 'playing') && !paused && view === 'none';

  // The promo band is only ~1/4 of the viewport height (a 1280-wide laptop gives
  // a 1280×331 box), far too short to hold the ready screen, the game-over card
  // or the 100-row leaderboard. Those overlays are therefore positioned against
  // the viewport instead of the band: the dialog root and the band box carry no
  // transform/filter/contain, so a `fixed` descendant's containing block is the
  // viewport and it escapes the band's `overflow-hidden`.
  const OV = PROMO ? 'fixed' : 'absolute';

  const content = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className={`fixed inset-0 z-[100] flex items-center justify-center outline-none ${
        mode === 'showcase' || PROMO ? 'bg-black' : 'bg-night-purple/95 p-2'
      }`}
      style={{
        touchAction: 'none',
        overscrollBehavior: 'contain',
        // A long press anywhere in the game must never pop the OS copy/lookup
        // menu (iOS text callout, Android selection toolbar) — holding the
        // screen is a normal way to idle mid-game.
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={(e) => {
        // Android fires contextmenu on long-press; swallow it except on the
        // name field, where the paste/edit menu must stay available.
        const el = e.target as HTMLElement | null;
        if (el?.tagName !== 'INPUT') e.preventDefault();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {mode === 'normal' && size.w > 0 && (
        <div
          className={
            PROMO
              ? 'relative overflow-hidden' // clean edges — nothing to crop out of the capture
              : 'relative overflow-hidden rounded-[1.75rem] shadow-2xl ring-2 ring-candy-pink/40'
          }
          style={{ width: size.w, height: size.h }}
        >
          {/* Canvas world */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full select-none"
            style={{ touchAction: 'none' }}
          />

          {/* Tap/flap input layer (ready + playing) */}
          {showField && (
            <div
              className={`${OV} inset-0 z-10`}
              style={{ touchAction: 'none' }}
              onPointerDown={onField}
              aria-hidden="true"
            />
          )}

          {/* Top HUD */}
          <div className={`pointer-events-none ${OV} inset-x-0 top-0 z-30 flex items-start justify-between p-3`}>
            <div>
              {phase === 'playing' && (
                <div className="flex items-center gap-1.5 rounded-pill bg-night-purple/60 px-3 py-1.5 font-display text-lg font-bold text-white shadow-candy">
                  <span aria-hidden="true">🍬</span>
                  <span ref={scoreElRef} className="tabular-nums">
                    0
                  </span>
                </div>
              )}
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? t('unmute') : t('mute')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-night-purple/70 text-white transition-colors hover:bg-candy-pink hover:text-night-purple"
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={requestClose}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-night-purple/70 text-white transition-colors hover:bg-candy-pink hover:text-night-purple"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Ready / start screen */}
          {phase === 'ready' && view === 'none' && (
            <div className={`pointer-events-none ${OV} inset-0 z-20 flex flex-col items-center justify-center px-6 text-center`}>
              <PabloSprite className="h-24 w-24 drop-shadow-[0_4px_16px_rgba(255,205,255,0.5)]" title="Pablo" />
              <h2 className="mt-3 font-display text-3xl font-bold text-white drop-shadow">
                {t('title')}
              </h2>
              <p className="mt-1 max-w-xs text-sm text-text-primary/90">{t('tagline')}</p>
              <div className="mt-5 animate-pulse rounded-pill bg-candy-pink px-5 py-2.5 font-display text-base font-bold text-night-purple shadow-candy">
                {t('start')}
              </div>
              <p className="mt-3 text-xs text-text-primary/70">
                <span className="hidden sm:inline">{t('flap_hint_desktop')}</span>
                <span className="sm:hidden">{t('flap_hint_mobile')}</span>
              </p>
              {best > 0 && (
                <p className="mt-3 text-sm font-medium text-candy-pink">
                  {t('best')}: <span className="font-display">{best}</span>
                </p>
              )}
              <button
                type="button"
                onClick={openBoard}
                className="pointer-events-auto mt-4 rounded-pill border border-candy-pink/50 px-4 py-1.5 text-xs font-semibold text-candy-pink transition-colors hover:bg-candy-pink hover:text-night-purple"
              >
                🏆 {t('leaderboard_title')}
              </button>
            </div>
          )}

          {/* Paused */}
          {paused && (
            <button
              type="button"
              onClick={handleResume}
              className={`${OV} inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-night-purple/70 backdrop-blur-sm`}
            >
              <span className="font-display text-3xl font-bold text-white">{t('paused')}</span>
              <span className="rounded-pill bg-candy-pink px-6 py-2.5 font-display font-bold text-night-purple shadow-candy">
                {t('resume')}
              </span>
            </button>
          )}

          {/* Game over — name form */}
          {phase === 'dead' && view === 'form' && result && (
            <div className={`${OV} inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-night-purple/85 px-6 text-center backdrop-blur-sm`}>
              {result.isBest && (
                <span className="rounded-pill bg-mint-green/90 px-4 py-1 font-display text-sm font-bold text-night-purple">
                  ✨ {t('new_best')} ✨
                </span>
              )}
              <h2 className="font-display text-3xl font-bold text-white">{t('game_over')}</h2>
              <div className="flex items-end justify-center gap-6">
                <div>
                  <div className="font-display text-5xl font-bold text-candy-pink">{result.score}</div>
                  <div className="text-xs uppercase tracking-wider text-text-muted">{t('score')}</div>
                </div>
                <div className="pb-1">
                  <div className="font-display text-2xl font-bold text-white">🍬 {result.candies}</div>
                  <div className="text-xs uppercase tracking-wider text-text-muted">{t('candies')}</div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-xs flex-col items-stretch gap-2">
                <label htmlFor="pablo-name" className="text-sm font-medium text-text-primary">
                  {t('your_name')}
                </label>
                <input
                  id="pablo-name"
                  type="text"
                  value={name}
                  maxLength={MAX_NAME}
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('name_placeholder')}
                  className="rounded-pill border-2 border-candy-pink/40 bg-surface px-4 py-2.5 text-center font-display text-lg text-white outline-none focus:border-candy-pink"
                  style={{
                    // Re-enable selection inside the input (the dialog root
                    // disables it globally to kill the long-press copy menu).
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    WebkitTouchCallout: 'default',
                  }}
                  autoFocus
                />
                <div className="mt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-pill bg-candy-pink px-4 py-2.5 font-display font-bold text-night-purple shadow-candy transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {submitting ? t('saving') : t('submit')}
                  </button>
                  <button
                    type="button"
                    onClick={skipForm}
                    disabled={submitting}
                    className="rounded-pill border border-white/30 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/10 disabled:opacity-60"
                  >
                    {t('skip')}
                  </button>
                </div>
                {globalBoard && (
                  <p className="text-[11px] text-text-muted">{t('public_name_note')}</p>
                )}
                {submitError && (
                  <p className="text-[11px] font-semibold text-candy-pink" role="alert">
                    {t('save_error')}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Game over — score recap (score didn't reach the board) */}
          {phase === 'dead' && view === 'gameover' && result && (
            <div className={`${OV} inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-night-purple/85 px-6 text-center backdrop-blur-sm`}>
              {result.isBest && (
                <span className="rounded-pill bg-mint-green/90 px-4 py-1 font-display text-sm font-bold text-night-purple">
                  ✨ {t('new_best')} ✨
                </span>
              )}
              <h2 className="font-display text-3xl font-bold text-white">{t('game_over')}</h2>
              <div className="flex items-end justify-center gap-6">
                <div>
                  <div className="font-display text-5xl font-bold text-candy-pink">{result.score}</div>
                  <div className="text-xs uppercase tracking-wider text-text-muted">{t('score')}</div>
                </div>
                <div className="pb-1">
                  <div className="font-display text-2xl font-bold text-white">🍬 {result.candies}</div>
                  <div className="text-xs uppercase tracking-wider text-text-muted">{t('candies')}</div>
                </div>
              </div>
              <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rounded-pill bg-candy-pink px-4 py-2.5 font-display font-bold text-night-purple shadow-candy transition-transform hover:scale-105 active:scale-95"
                >
                  {t('restart')}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={openBoard}
                    className="flex-1 rounded-pill border border-candy-pink/50 px-4 py-2.5 text-sm font-semibold text-candy-pink transition-colors hover:bg-candy-pink hover:text-night-purple"
                  >
                    🏆 {t('leaderboard_title')}
                  </button>
                  <button
                    type="button"
                    onClick={requestClose}
                    className="rounded-pill border border-white/30 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/10"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {view === 'board' && (
            <div className={`${OV} inset-0 z-40 flex flex-col bg-night-purple/90 px-5 py-5 backdrop-blur-sm`}>
              <h2 className="text-center font-display text-2xl font-bold text-white">
                🏆 {t('leaderboard_title')}
              </h2>
              <div className="relative mt-3 min-h-0 flex-1">
                <div
                  ref={boardScrollRef}
                  onScroll={updateBoardFade}
                  className="h-full overflow-y-auto pr-1"
                >
                  <Leaderboard
                    entries={board}
                    highlightIndex={highlightIdx}
                    loading={boardLoading}
                    personalBest={best}
                    personalName={getLastName() || undefined}
                  />
                </div>
                {boardFade && (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-night-purple/90 to-transparent"
                    aria-hidden="true"
                  />
                )}
              </div>
              <p className="mt-2 text-center text-[11px] text-text-muted">
                {globalBoard ? t('global_note') : t('local_note')}
              </p>
              <div className="mt-3 flex gap-2">
                {phase === 'dead' ? (
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="flex-1 rounded-pill bg-candy-pink px-4 py-2.5 font-display font-bold text-night-purple shadow-candy transition-transform hover:scale-105 active:scale-95"
                  >
                    {t('restart')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setView('none')}
                    className="flex-1 rounded-pill bg-candy-pink px-4 py-2.5 font-display font-bold text-night-purple shadow-candy transition-transform hover:scale-105 active:scale-95"
                  >
                    {t('back')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={requestClose}
                  className="rounded-pill border border-white/30 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/10"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cinematic showcase — full-width 32:9 band, no HUD, hands-off */}
      {mode === 'showcase' && size.w > 0 && (
        <div className="relative" style={{ width: size.w, height: size.h }}>
          <canvas
            ref={canvasRef}
            className="block h-full w-full select-none"
            style={{ touchAction: 'none' }}
          />
          {!showEndCard && (
            <p className="pointer-events-none absolute bottom-3 right-4 text-[11px] font-medium uppercase tracking-widest text-white/30">
              Esc
            </p>
          )}
        </div>
      )}

      {mode === 'showcase' && showEndCard && <ShowcaseEndCard onDismiss={requestClose} />}
    </div>
  );

  return createPortal(content, document.body);
}
