// =============================================================================
// Pablo's Garden Run — leaderboard (device-local)
// -----------------------------------------------------------------------------
// The site is a static export on Vercel's free tier with no backend, so the
// leaderboard is stored in localStorage: a per-device top-10. The API is kept
// small and storage-agnostic so it could later be swapped for a shared backend
// (e.g. a serverless KV) without touching the UI.
// =============================================================================

export interface ScoreEntry {
  name: string;
  score: number;
  /** ISO date string (yyyy-mm-dd) — when the score was set. */
  date: string;
}

const KEY = 'pablo-parrot-leaderboard-v1';
const NAME_KEY = 'pablo-parrot-last-name';
const MAX_ENTRIES = 10;
const MAX_NAME = 12;

function read(): ScoreEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is ScoreEntry =>
          typeof e === 'object' &&
          e !== null &&
          typeof (e as ScoreEntry).name === 'string' &&
          typeof (e as ScoreEntry).score === 'number'
      )
      .map((e) => ({ name: e.name, score: e.score, date: typeof e.date === 'string' ? e.date : '' }));
  } catch {
    return [];
  }
}

function write(entries: ScoreEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* storage full / blocked (private mode) — fail silently */
  }
}

function sortAndTrim(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
}

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

export function getScores(): ScoreEntry[] {
  return sortAndTrim(read());
}

export function getBestScore(): number {
  return read().reduce((max, e) => Math.max(max, e.score), 0);
}

/** Would this score make it onto the (full) board? */
export function qualifies(score: number): boolean {
  if (score <= 0) return false;
  const board = getScores();
  return board.length < MAX_ENTRIES || score > board[board.length - 1].score;
}

export function getLastName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * Add a score and return the updated top-10 board. `todayISO` may be supplied by
 * the caller; otherwise a date stamp is derived on the client at call time.
 */
export function addScore(name: string, score: number, todayISO?: string): ScoreEntry[] {
  const clean = sanitizeName(name) || 'Pablo';
  const date = todayISO ?? new Date().toISOString().slice(0, 10);
  const entries = read();
  entries.push({ name: clean, score, date });
  const board = sortAndTrim(entries);
  write(board);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(NAME_KEY, clean);
    } catch {
      /* ignore */
    }
  }
  return board;
}
