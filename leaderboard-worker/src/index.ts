// =============================================================================
// "La Corsa di Pablo" — global leaderboard Worker (Cloudflare + D1)
// -----------------------------------------------------------------------------
// A tiny HTTP backend for the hidden parrot mini-game's top-10 board. Deployed
// independently from the Next.js site (which talks to it via fetch). Free tier,
// EU data residency (set at D1 creation), and an anti-cheat layer proportionate
// to a festival easter egg:
//
//   * scores are submitted by the browser, so they can never be *fully* trusted;
//   * but a forged "9999 in 1 second" is rejected: every run must first fetch a
//     server-signed session token (GET /session), and a submit is only accepted
//     if (now - token.iat) >= score * MIN_MS_PER_POINT — you cannot claim a score
//     faster than it could plausibly be earned, and you cannot forge the start
//     time because the token is HMAC-signed with a server-only secret;
//   * a per-IP rate limit (hashed IP, never stored raw) blocks floods;
//   * names are re-sanitised server-side; the board is pruned to the top 200.
//
// Endpoints (JSON):
//   GET    /session        -> { token }                       (start of a run)
//   GET    /scores         -> { scores: [{name,score,date}] } (top 10)
//   POST   /scores         -> { scores: [...] }               (submit; needs token)
//   DELETE /scores/:id     -> { deleted: true }               (admin; Bearer token)
//   OPTIONS *              -> CORS preflight
// =============================================================================

export interface Env {
  DB: D1Database;
  /** HMAC key for session tokens + IP hashing. Set via `wrangler secret put`. */
  SIGNING_SECRET: string;
  /** Bearer token guarding DELETE. Set via `wrangler secret put`. */
  ADMIN_TOKEN: string;
  /** Comma-separated allowlist of browser origins (exact, "*", or "*.suffix"). */
  ALLOWED_ORIGINS: string;
}

// -- tunables -----------------------------------------------------------------
const TOP_N = 10; // entries returned to clients
const KEEP_N = 200; // entries physically retained (storage bound)
const SCORE_CAP = 50_000; // generous upper bound; blocks absurd/overflow values
const MIN_MS_PER_POINT = 50; // plausibility floor: >= 50ms of play per point
const TOKEN_MAX_AGE_MS = 6 * 60 * 60 * 1000; // a session token is valid for 6h
const RL_LIMIT = 12; // submissions allowed per window per IP
const RL_WINDOW_MS = 60_000; // rate-limit window
const MAX_NAME = 12; // must match the client's sanitizeName cap

// -- crypto helpers -----------------------------------------------------------

const enc = new TextEncoder();

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function b64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
}

/** Length-aware constant-time string compare (avoids early-exit timing leaks). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// -- session tokens -----------------------------------------------------------

async function issueToken(env: Env): Promise<string> {
  const payload = JSON.stringify({ iat: Date.now(), n: crypto.randomUUID() });
  const body = b64urlEncode(payload);
  const sig = await hmacHex(env.SIGNING_SECRET, body);
  return `${body}.${sig}`;
}

async function verifyToken(env: Env, token: string): Promise<{ iat: number } | null> {
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacHex(env.SIGNING_SECRET, body);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const p: unknown = JSON.parse(b64urlDecode(body));
    if (typeof p === 'object' && p !== null && typeof (p as { iat: unknown }).iat === 'number') {
      return { iat: (p as { iat: number }).iat };
    }
    return null;
  } catch {
    return null;
  }
}

// -- name sanitising (mirrors the client) ------------------------------------

function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) continue; // strip control chars
    out += ch;
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
}

// -- CORS ---------------------------------------------------------------------

function resolveOrigin(env: Env, origin: string | null): string | null {
  if (!origin) return null;
  const list = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const entry of list) {
    if (entry === '*') return origin;
    if (entry.startsWith('*.')) {
      if (origin.endsWith(entry.slice(1))) return origin; // ".vercel.app"
    } else if (entry === origin) {
      return origin;
    }
  }
  return null;
}

function corsHeaders(allowOrigin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
  if (allowOrigin) h['access-control-allow-origin'] = allowOrigin;
  return h;
}

function json(obj: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });
}

// -- data access --------------------------------------------------------------

interface ScoreRow {
  name: string;
  score: number;
  created_at: number;
}

async function topScores(env: Env): Promise<{ name: string; score: number; date: string }[]> {
  const rs = await env.DB.prepare(
    'SELECT name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT ?'
  )
    .bind(TOP_N)
    .all<ScoreRow>();
  return (rs.results ?? []).map((r) => ({
    name: r.name,
    score: r.score,
    date: new Date(r.created_at).toISOString().slice(0, 10),
  }));
}

/**
 * Atomically counts this IP's submissions in the current window and returns true
 * once the limit is exceeded. A single counted upsert (no separate SELECT) avoids
 * the check-then-act race that could otherwise let a same-IP burst slip past.
 */
async function rateLimited(env: Env, key: string, now: number): Promise<boolean> {
  const row = await env.DB.prepare(
    'INSERT INTO rl (k, n, reset_at) VALUES (?, 1, ?) ' +
      'ON CONFLICT(k) DO UPDATE SET ' +
      'n = CASE WHEN rl.reset_at <= ? THEN 1 ELSE rl.n + 1 END, ' +
      'reset_at = CASE WHEN rl.reset_at <= ? THEN excluded.reset_at ELSE rl.reset_at END ' +
      'RETURNING n'
  )
    .bind(key, now + RL_WINDOW_MS, now, now)
    .first<{ n: number }>();
  await env.DB.prepare('DELETE FROM rl WHERE reset_at <= ?').bind(now).run(); // prune expired
  return (row?.n ?? 1) > RL_LIMIT;
}

// -- handlers -----------------------------------------------------------------

async function handlePost(req: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400, cors);
  }
  const b = (body ?? {}) as { name?: unknown; score?: unknown; token?: unknown };

  const score = b.score;
  if (typeof score !== 'number' || !Number.isInteger(score) || score <= 0 || score > SCORE_CAP) {
    return json({ error: 'bad_score' }, 400, cors);
  }

  const token = typeof b.token === 'string' ? b.token : '';
  const payload = await verifyToken(env, token);
  if (!payload) return json({ error: 'bad_token' }, 403, cors);

  const now = Date.now();
  const elapsed = now - payload.iat;
  if (elapsed < 0 || elapsed > TOKEN_MAX_AGE_MS) return json({ error: 'stale_token' }, 403, cors);
  if (elapsed < score * MIN_MS_PER_POINT) return json({ error: 'implausible' }, 422, cors);

  const ip = req.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
  const ipHash = await hmacHex(env.SIGNING_SECRET, 'ip:' + ip);
  if (await rateLimited(env, ipHash, now)) return json({ error: 'rate_limited' }, 429, cors);

  const name = sanitizeName(b.name) || 'Pablo';
  await env.DB.prepare('INSERT INTO scores (name, score, created_at) VALUES (?, ?, ?)')
    .bind(name, score, now)
    .run();
  // Keep only the best KEEP_N to bound storage.
  await env.DB.prepare(
    'DELETE FROM scores WHERE id NOT IN ' +
      '(SELECT id FROM scores ORDER BY score DESC, created_at ASC LIMIT ?)'
  )
    .bind(KEEP_N)
    .run();

  return json({ scores: await topScores(env) }, 200, cors);
}

async function handleDelete(req: Request, env: Env, path: string): Promise<Response> {
  const auth = req.headers.get('Authorization') ?? '';
  if (!env.ADMIN_TOKEN || !timingSafeEqual(auth, `Bearer ${env.ADMIN_TOKEN}`)) {
    return json({ error: 'unauthorized' }, 401);
  }
  const raw = path.slice('/scores/'.length);
  if (!/^[0-9]+$/.test(raw)) return json({ error: 'bad_id' }, 400); // plain decimal only
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'bad_id' }, 400);
  await env.DB.prepare('DELETE FROM scores WHERE id = ?').bind(id).run();
  return json({ deleted: true }, 200);
}

// -- entrypoint ---------------------------------------------------------------

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const allow = resolveOrigin(env, req.headers.get('Origin'));
    const cors = corsHeaders(allow);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      // Admin moderation (server-to-server; no CORS needed).
      if (req.method === 'DELETE' && path.startsWith('/scores/')) {
        return await handleDelete(req, env, path);
      }
      if (req.method === 'GET' && path === '/session') {
        return json({ token: await issueToken(env) }, 200, cors);
      }
      if (req.method === 'GET' && path === '/scores') {
        return json({ scores: await topScores(env) }, 200, cors);
      }
      if (req.method === 'POST' && path === '/scores') {
        // Hygiene only (Origin is client-set): real protection is the token + rate limit.
        if (!allow) return json({ error: 'forbidden_origin' }, 403, cors);
        return await handlePost(req, env, cors);
      }
      return json({ error: 'not_found' }, 404, cors);
    } catch (err) {
      // Keep failures CORS-readable and stably shaped (e.g. a transient D1 error).
      console.error('worker error', err);
      return json({ error: 'server' }, 500, cors);
    }
  },
} satisfies ExportedHandler<Env>;
