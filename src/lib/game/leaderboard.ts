// =============================================================================
// Pablo's Garden Run — leaderboard (global, with local fallback)
// -----------------------------------------------------------------------------
// Two modes, picked automatically from the build-time env:
//
//   * GLOBAL  — when NEXT_PUBLIC_LEADERBOARD_URL points at the Cloudflare Worker
//     (see leaderboard-worker/). Scores are shared and permanent across devices,
//     with ONE row per device (the device's highest score). localStorage is kept
//     as a read cache so the board renders instantly and survives the backend
//     being briefly unreachable.
//
//   * LOCAL   — when the env is unset (e.g. before the Worker is deployed). The
//     board is a per-device top-100 in localStorage. This keeps the game fully
//     working at all times.
//
// The personal best ("Record"), last-used name and device id are ALWAYS local +
// synchronous (instant UI, offline-safe). Only the shared top-100 goes over the
// network.
// =============================================================================

export interface ScoreEntry {
  name: string;
  score: number;
  /** ISO date string (yyyy-mm-dd) — when the score was set. */
  date: string;
}

const BASE = (process.env.NEXT_PUBLIC_LEADERBOARD_URL ?? '').replace(/\/+$/, '');
const GLOBAL = BASE.length > 0;

const CACHE_KEY = 'pablo-parrot-leaderboard-v1'; // local board / global cache
const NAME_KEY = 'pablo-parrot-last-name';
const BEST_KEY = 'pablo-parrot-best';
const DEVICE_KEY = 'pablo-parrot-device';
const MAX_ENTRIES = 100; // must match the Worker's TOP_N
export const MAX_NAME = 12;

/** Server-signed token for the current run (GLOBAL mode); null until primed. */
let sessionToken: string | null = null;
/** In-flight /session request, so a submit can await a not-yet-arrived token. */
let sessionPending: Promise<void> | null = null;

// -- local storage helpers ----------------------------------------------------

function readCache(): ScoreEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return normalize(parsed);
  } catch {
    return [];
  }
}

function writeCache(entries: ScoreEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    /* storage full / blocked (private mode) — fail silently */
  }
}

/** Coerce arbitrary parsed JSON into a clean, sorted, trimmed ScoreEntry[]. */
function normalize(parsed: unknown): ScoreEntry[] {
  if (!Array.isArray(parsed)) return [];
  const clean = parsed
    .filter(
      (e): e is ScoreEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as ScoreEntry).name === 'string' &&
        typeof (e as ScoreEntry).score === 'number'
    )
    .map((e) => ({
      name: e.name,
      score: e.score,
      date: typeof e.date === 'string' ? e.date : '',
    }));
  return sortAndTrim(clean);
}

function sortAndTrim(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// -- personal best + identity (always local, sync) ----------------------------

export function sanitizeName(raw: string): string {
  // Drop control characters, collapse runs of whitespace, trim, cap length.
  let out = '';
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) continue; // control chars
    out += ch;
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
}

export function getBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    if (raw !== null) {
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
    // Migrate from a pre-existing LOCAL board only (back-compat). In GLOBAL mode
    // CACHE_KEY is the shared world board, NOT this device's scores, so it must
    // not seed the personal best.
    if (GLOBAL) return 0;
    return readCache().reduce((max, e) => Math.max(max, e.score), 0);
  } catch {
    return 0;
  }
}

function recordBest(score: number): void {
  if (typeof window === 'undefined') return;
  try {
    if (score > getBestScore()) window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    /* ignore */
  }
}

export function getLastName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveLastName(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

function newDeviceId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Session fallback id, used only when localStorage is unavailable (see below). */
let memDeviceId: string | null = null;

/**
 * A stable, random per-device id (localStorage). Lets the global board keep a
 * single row per device — its highest score — instead of one row per submission.
 * Pseudonymous: a random id, sent only to our own leaderboard with the score.
 *
 * When localStorage is blocked (e.g. private browsing), we cannot persist an id
 * across reloads, but we keep a stable in-memory id for the current page session
 * so repeated runs in that session still dedupe to ONE row server-side instead
 * of stacking a fresh anonymous (NULL-device) row per submission.
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = newDeviceId();
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    if (!memDeviceId) memDeviceId = newDeviceId();
    return memDeviceId;
  }
}

// -- public API ---------------------------------------------------------------

export function isGlobalLeaderboard(): boolean {
  return GLOBAL;
}

/**
 * "Keep your highest" model: only prompt to save when the score beats the
 * player's own best, since the global board keeps a single row per device (its
 * highest score) — submitting anything lower would change nothing.
 */
export function qualifies(score: number): boolean {
  return score > 0 && score > getBestScore();
}

/**
 * GLOBAL mode: fire-and-forget a server-signed session token at the start of a
 * run, so a later submit can prove how long the run plausibly took. No-op (and
 * harmless) in LOCAL mode or on the server.
 */
export function primeSession(): void {
  if (!GLOBAL || typeof window === 'undefined') return;
  if (sessionToken !== null || sessionPending !== null) return; // already have/getting one
  sessionPending = fetch(`${BASE}/session`, { headers: { accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: unknown) => {
      if (d && typeof d === 'object' && typeof (d as { token: unknown }).token === 'string') {
        sessionToken = (d as { token: string }).token;
      }
    })
    .catch(() => {
      /* offline / blocked — submit will simply fall back */
    })
    .finally(() => {
      sessionPending = null;
    });
}

/** Fetch the shared top-100 (GLOBAL) or read the local board (LOCAL). */
export async function getScores(): Promise<ScoreEntry[]> {
  if (GLOBAL && typeof window !== 'undefined') {
    try {
      const r = await fetch(`${BASE}/scores`, { headers: { accept: 'application/json' } });
      if (r.ok) {
        const data: unknown = await r.json();
        const board = normalize((data as { scores?: unknown })?.scores);
        writeCache(board);
        return board;
      }
    } catch {
      /* fall through to cache */
    }
    return readCache();
  }
  return readCache();
}

/**
 * Submit a score and return the updated top-100.
 *
 * GLOBAL mode throws on a failed submit (network error or rejection) so the UI
 * can show a retry; the personal best is still recorded locally first. The
 * server keeps only this device's highest score (one row per device). LOCAL
 * mode never throws — it just updates the device board.
 */
export async function addScore(name: string, score: number): Promise<ScoreEntry[]> {
  const clean = sanitizeName(name) || 'Pablo';
  saveLastName(clean);
  recordBest(score);

  if (GLOBAL && typeof window !== 'undefined') {
    // The token was primed at run start; if it hasn't landed yet (slow network /
    // very short run), wait for the in-flight request rather than failing.
    if (sessionToken === null && sessionPending !== null) {
      try {
        await sessionPending;
      } catch {
        /* fall through with whatever token we have */
      }
    }
    const r = await fetch(`${BASE}/scores`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: clean, score, token: sessionToken, device: getDeviceId() }),
    });
    if (!r.ok) throw new Error(`submit_failed_${r.status}`);
    const data: unknown = await r.json();
    const board = normalize((data as { scores?: unknown })?.scores);
    sessionToken = null; // consume: the next scored run primes a fresh token
    writeCache(board);
    return board;
  }

  // LOCAL mode — per-device top-100.
  const entries = readCache();
  entries.push({ name: clean, score, date: todayISO() });
  const board = sortAndTrim(entries);
  writeCache(board);
  return board;
}
