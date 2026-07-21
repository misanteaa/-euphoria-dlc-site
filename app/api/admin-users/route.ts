import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { admin_token, action, user_id, role, ban_reason } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    if (action === "list") {
      const users = db
        .prepare("SELECT id, username, email, role, subscription_end, hwid, is_admin, banned, ban_reason, created_at FROM users ORDER BY id")
        .all();
      return NextResponse.json({ ok: true, users });
    }

    if (action === "set-role") {
      if (!user_id || !role) {
        return NextResponse.json({ error: "Укажите user_id и role" }, { status: 400 });
      }

      const validRoles = ["user", "media", "tester", "admin"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Роль должна быть: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }

      if (role === "admin") {
        db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(user_id);
      } else {
        db.prepare("UPDATE users SET is_admin = 0 WHERE id = ?").run(user_id);
      }

      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, user_id);

      return NextResponse.json({ ok: true });
    }

    if (action === "ban") {
      if (!user_id) {
        return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      }
      db.prepare("UPDATE users SET banned = 1, ban_reason = ? WHERE id = ?").run(ban_reason || null, user_id);
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "unban") {
      if (!user_id) {
        return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      }
      db.prepare("UPDATE users SET banned = 0, ban_reason = NULL WHERE id = ?").run(user_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      if (!user_id) {
        return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      }
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user_id);
      db.prepare("DELETE FROM users WHERE id = ?").run(user_id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
