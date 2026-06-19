-- D1 schema for the global leaderboard.
-- Run once against the remote DB:  npm run db:init   (see README).

CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  created_at INTEGER NOT NULL,         -- unix epoch milliseconds
  device     TEXT                       -- opaque per-device id (one row per device)
);

-- Ranking index: highest score first, earliest submission wins ties.
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores (score DESC, created_at ASC);
-- One row per device: its highest score, kept via upsert on submit.
CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_device ON scores (device);

-- Ephemeral rate-limit buckets keyed by a *hashed* IP (never the raw IP).
-- Rows are short-lived and pruned opportunistically on each write.
CREATE TABLE IF NOT EXISTS rl (
  k        TEXT    PRIMARY KEY,        -- HMAC(secret, "ip:" + ip)
  n        INTEGER NOT NULL,           -- submissions in the current window
  reset_at INTEGER NOT NULL           -- unix ms when the window resets
);
