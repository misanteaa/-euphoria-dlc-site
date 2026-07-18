import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db, { User } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { login, password, remember } = await req.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 }
      );
    }

    // login — это email ИЛИ имя пользователя
    const user = db
      .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
      .get(login, login) as User | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    await createSession(user.id, remember !== false);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
