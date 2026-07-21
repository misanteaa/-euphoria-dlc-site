import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query, queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не меньше 6 символов" }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const exists = await queryOne("SELECT id FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (exists) {
      return NextResponse.json({ error: "Пользователь с таким именем или email уже существует" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hash]
    );

    await createSession(result.rows[0].id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
