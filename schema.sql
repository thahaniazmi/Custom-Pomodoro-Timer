-- Cloudflare D1 Database Schema for Flowstate Pomodoro

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  salt TEXT NOT NULL DEFAULT '',
  country TEXT DEFAULT 'United States',
  flag TEXT DEFAULT '🌐',
  is_anonymous INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- 2. User Focus Stats & Leaderboard Data
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  daily_secs INTEGER DEFAULT 0,
  weekly_secs INTEGER DEFAULT 0,
  alltime_secs INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  last_active_date TEXT,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Verification OTP Codes (Sign Up & Password Reset)
CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'signup' or 'reset_password'
  expires_at INTEGER NOT NULL
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_stats_daily ON user_stats(daily_secs DESC);
CREATE INDEX IF NOT EXISTS idx_stats_weekly ON user_stats(weekly_secs DESC);
CREATE INDEX IF NOT EXISTS idx_stats_alltime ON user_stats(alltime_secs DESC);
