import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL || "", {
  ssl: { rejectUnauthorized: false },
  max: 10,
});

export async function query(text: string, params?: any[]) {
  return await sql.unsafe(text, params ?? []);
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await sql.unsafe(text, params ?? []);
  return rows[0] ?? null;
}

export async function queryAll(text: string, params?: any[]) {
  return await sql.unsafe(text, params ?? []);
}

export default sql;

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
