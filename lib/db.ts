import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.cwd();
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, "euphoria.db");
const db = new Database(dbPath);

// WAL — быстрее и надёжнее при одновременных запросах
db.pragma("journal_mode = WAL");

// Таблица пользователей
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    subscription_end TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Таблица сессий (токен -> пользователь)
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Таблица лицензионных ключей
db.exec(`
  CREATE TABLE IF NOT EXISTS keys (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    key           TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL,
    activated_by  INTEGER,
    activated_at  TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL
  );
`);

// Добавляем поле subscription_end если его нет (миграция)
try {
  db.exec(`ALTER TABLE users ADD COLUMN subscription_end TEXT`);
} catch {
  // колонка уже существует
}

// Добавляем поле hwid если его нет (миграция)
try {
  db.exec(`ALTER TABLE users ADD COLUMN hwid TEXT`);
} catch {
  // колонка уже существует
}

// Добавляем поле is_admin если его нет (миграция)
try {
  db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`);
} catch {
  // колонка уже существует
}

// Добавляем поле role если его нет (миграция)
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
} catch {
  // колонка уже существует
}

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  subscription_end: string | null;
  hwid: string | null;
  is_admin: number;
  role: string;
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

export default db;
