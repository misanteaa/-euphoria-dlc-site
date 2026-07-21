import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db, { User } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password, hwid } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Введите логин и пароль" },
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)")
      .get(username) as User | undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    if (user.banned) {
      return NextResponse.json(
        { success: false, error: user.ban_reason || "Ваш аккаунт заблокирован" },
        { status: 403 }
      );
    }

    if (hwid) {
      if (user.hwid && user.hwid !== hwid) {
        return NextResponse.json(
          { success: false, error: "HWID не совпадает. Используй ключ сброса HWID." },
          { status: 403 }
        );
      }
      if (!user.hwid) {
        db.prepare("UPDATE users SET hwid = ? WHERE id = ?").run(hwid, user.id);
      }
    }

    return NextResponse.json({
      success: true,
      uid: user.id,
      username: user.username,
      email: user.email,
      role: user.role || "user",
      subscription_end: user.subscription_end || null,
      beta_access: !!user.is_admin,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
