import { NextResponse } from "next/server";
import crypto from "crypto";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { count = 1, admin_token } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments = [7, 4, 4];
    const numKeys = Math.min(Math.max(1, Number(count)), 100);
    const keys: string[] = [];

    for (let i = 0; i < numKeys; i++) {
      let key = "";
      let unique = false;
      while (!unique) {
        key = "HWID-" + segments.map((len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")).join("");
        const existing = await queryOne("SELECT id FROM keys WHERE key = $1", [key]);
        if (!existing) unique = true;
      }
      await query("INSERT INTO keys (key, duration_days) VALUES ($1, 0)", [key]);
      keys.push(key);
    }

    return NextResponse.json({ ok: true, keys });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
