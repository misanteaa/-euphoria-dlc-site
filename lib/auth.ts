import { cookies } from "next/headers";
import crypto from "crypto";
import db, { User } from "./db";

const COOKIE_NAME = "euphoria_session";

// Создаёт сессию для пользователя и ставит cookie
export async function createSession(userId: number, remember: boolean = true) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(
    token,
    userId
  );

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined, // 30 дней или до закрытия браузера
  });
}

// Возвращает текущего пользователя по cookie (или null)
export async function getCurrentUser(): Promise<Omit<
  User,
  "password"
> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const row = db
    .prepare(
      `SELECT u.id, u.username, u.email, u.created_at, u.subscription_end, u.hwid, u.is_admin, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as Omit<User, "password"> | undefined;

  return row ?? null;
}

// Удаляет сессию (выход)
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    cookieStore.delete(COOKIE_NAME);
  }
}
