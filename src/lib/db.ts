import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Lazy singleton — only initialises when the first query runs at runtime,
// not during Next.js build-time module evaluation.
let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Re-export as a tagged-template-literal proxy so every route can keep
// using  await sql`...`  without any changes.
const sql = (strings: TemplateStringsArray, ...values: unknown[]) =>
  getSql()(strings as any, ...values);

export default sql;

// ─── Schema migrations ────────────────────────────────────────────────────
export async function runMigrations() {
  const q = getSql();
  await q`
    CREATE TABLE IF NOT EXISTS teams (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      track TEXT NOT NULL CHECK(track IN ('A','B','C')),
      lead_name TEXT NOT NULL,
      lead_email TEXT,
      college TEXT,
      size INTEGER,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      team_code TEXT NOT NULL REFERENCES teams(code),
      name TEXT NOT NULL,
      reg_no TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_code)`;
  await q`
    CREATE TABLE IF NOT EXISTS judges (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS admins (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS kits (
      team_code TEXT PRIMARY KEY REFERENCES teams(code),
      disease TEXT NOT NULL,
      patient TEXT NOT NULL,
      problem TEXT NOT NULL,
      tech TEXT NOT NULL,
      budget TEXT NOT NULL,
      constraint_text TEXT NOT NULL,
      drawn_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      team_code TEXT NOT NULL REFERENCES teams(code),
      round_idx INTEGER NOT NULL,
      content TEXT,
      file_url TEXT,
      file_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
      decided_by TEXT REFERENCES judges(username),
      decided_at TIMESTAMPTZ,
      feedback TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS idx_submissions_team_round ON submissions(team_code, round_idx)`;
  await q`
    CREATE TABLE IF NOT EXISTS judge_assignments (
      id SERIAL PRIMARY KEY,
      judge_username TEXT NOT NULL REFERENCES judges(username),
      team_code TEXT NOT NULL REFERENCES teams(code),
      round_idx INTEGER NOT NULL,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(judge_username, team_code, round_idx)
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS idx_assignments_judge ON judge_assignments(judge_username)`;
  await q`
    CREATE TABLE IF NOT EXISTS scores (
      team_code TEXT NOT NULL REFERENCES teams(code),
      judge_username TEXT NOT NULL REFERENCES judges(username),
      round_idx INTEGER NOT NULL,
      medical INTEGER NOT NULL,
      technical INTEGER NOT NULL,
      adapt INTEGER NOT NULL,
      budget INTEGER NOT NULL,
      innovation INTEGER NOT NULL,
      pitch INTEGER NOT NULL,
      total REAL NOT NULL,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (team_code, judge_username, round_idx)
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS round_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_round_idx INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','active','ended')),
      started_rounds TEXT NOT NULL DEFAULT '[]'
    )
  `;
  await q`INSERT INTO round_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  await q`
    CREATE TABLE IF NOT EXISTS twist_deck (
      id SERIAL PRIMARY KEY,
      round_idx INTEGER NOT NULL,
      text TEXT NOT NULL,
      revealed INTEGER NOT NULL DEFAULT 0,
      revealed_at TIMESTAMPTZ
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS admin_log (
      id SERIAL PRIMARY KEY,
      actor TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      identifier TEXT NOT NULL,
      ip TEXT NOT NULL,
      success INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier, created_at)`;
}