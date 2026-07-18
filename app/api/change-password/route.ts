import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db, { User } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не меньше 6 символов" },
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(me.id) as User | undefined;
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const hash = await bcrypt.hash(password, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hash, me.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
