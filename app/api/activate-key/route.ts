import { NextResponse } from "next/server";
import db, { LicenseKey } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

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

    const now = new Date();
    const userRow = db
      .prepare("SELECT subscription_end FROM users WHERE id = ?")
      .get(user.id) as { subscription_end: string | null } | undefined;

    let subEnd: Date;
    if (userRow?.subscription_end) {
      const current = new Date(userRow.subscription_end);
      subEnd = current > now ? addDays(current, licenseKey.duration_days) : addDays(now, licenseKey.duration_days);
    } else {
      subEnd = addDays(now, licenseKey.duration_days);
    }

    db.prepare("UPDATE users SET subscription_end = ? WHERE id = ?").run(
      formatDate(subEnd),
      user.id
    );

    db.prepare(
      "UPDATE keys SET activated_by = ?, activated_at = ? WHERE id = ?"
    ).run(user.id, formatDate(now), licenseKey.id);

    return NextResponse.json({
      ok: true,
      subscription_end: formatDate(subEnd),
      duration_days: licenseKey.duration_days,
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
