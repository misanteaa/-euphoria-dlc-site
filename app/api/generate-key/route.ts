import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = [7, 4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        chars[crypto.randomInt(chars.length)]
      ).join("")
    )
    .join("-");
}

export async function POST(req: Request) {
  try {
    const { duration_days, count = 1, admin_token } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    if (!duration_days || duration_days < 1) {
      return NextResponse.json(
        { error: "Укажите длительность в днях" },
        { status: 400 }
      );
    }

    const numKeys = Math.min(Math.max(1, Number(count)), 100);
    const keys: string[] = [];

    const insert = db.prepare(
      "INSERT INTO keys (key, duration_days) VALUES (?, ?)"
    );

    for (let i = 0; i < numKeys; i++) {
      let key = generateKey();
      while (db.prepare("SELECT id FROM keys WHERE key = ?").get(key)) {
        key = generateKey();
      }
      insert.run(key, duration_days);
      keys.push(key);
    }

    return NextResponse.json({ ok: true, keys });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
