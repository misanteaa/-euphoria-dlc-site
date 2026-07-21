import { cookies } from "next/headers";
import crypto from "crypto";
import { query, queryOne, User } from "./db";

const COOKIE_NAME = "euphoria_session";

export async function createSession(userId: number, remember: boolean = true) {
  const token = crypto.randomBytes(32).toString("hex");
  await query("INSERT INTO sessions (token, user_id) VALUES ($1, $2)", [token, userId]);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
  });
}

export async function getCurrentUser(): Promise<Omit<User, "password"> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const row = await queryOne(
    `SELECT u.id, u.username, u.email, u.created_at, u.subscription_end, u.hwid, u.is_admin, u.role, u.banned, u.ban_reason
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1`,
    [token]
  );

  return row ?? null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await query("DELETE FROM sessions WHERE token = $1", [token]);
    cookieStore.delete(COOKIE_NAME);
  }
}
