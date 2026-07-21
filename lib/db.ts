import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        username   TEXT UNIQUE NOT NULL,
        email      TEXT UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        subscription_end TEXT,
        hwid       TEXT,
        is_admin   INTEGER DEFAULT 0,
        role       TEXT DEFAULT 'user',
        banned     INTEGER DEFAULT 0,
        ban_reason TEXT,
        beta_access INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token      TEXT PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS keys (
        id            SERIAL PRIMARY KEY,
        key           TEXT UNIQUE NOT NULL,
        duration_days INTEGER NOT NULL,
        activated_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
        activated_at  TEXT,
        created_at    TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS news (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        content    TEXT NOT NULL,
        tag        TEXT DEFAULT 'Новость',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_keys_key ON keys(key);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log("DB tables initialized");
  } catch (e: any) {
    console.error("DB init error:", e.message);
  }
}

initDb();

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

export async function queryOne(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows[0] ?? null;
}

export async function queryAll(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
}

export default pool;

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  subscription_end: string | null;
  hwid: string | null;
  is_admin: number;
  role: string;
  banned: number;
  ban_reason: string | null;
  beta_access: number;
  created_at: string;
};

export type LicenseKey = {
  id: number;
  key: string;
  duration_days: number;
  activated_by: number | null;
  activated_at: string | null;
  created_at: string;
};
