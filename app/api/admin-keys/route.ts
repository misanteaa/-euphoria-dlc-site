import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { admin_token } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    const keys = db.prepare("SELECT * FROM keys ORDER BY id DESC").all();
    return NextResponse.json({ ok: true, keys });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
