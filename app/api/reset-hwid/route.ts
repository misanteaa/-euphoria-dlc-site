import { NextResponse } from "next/server";
import db, { LicenseKey } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { key } = await req.json();
    if (!key || !key.trim()) {
      return NextResponse.json(
        { error: "Введите ключ" },
        { status: 400 }
      );
    }

    const licenseKey = db
      .prepare("SELECT * FROM keys WHERE key = ?")
      .get(key.trim().toUpperCase()) as LicenseKey | undefined;

    if (!licenseKey) {
      return NextResponse.json(
        { error: "Ключ не найден" },
        { status: 404 }
      );
    }

    if (licenseKey.activated_by) {
      return NextResponse.json(
        { error: "Ключ уже был использован" },
        { status: 409 }
      );
    }

    if (licenseKey.duration_days !== 0) {
      return NextResponse.json(
        { error: "Это ключ подписки, а не сброса HWID" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    db.prepare("UPDATE users SET hwid = NULL WHERE id = ?").run(user.id);

    db.prepare(
      "UPDATE keys SET activated_by = ?, activated_at = ? WHERE id = ?"
    ).run(user.id, now, licenseKey.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
