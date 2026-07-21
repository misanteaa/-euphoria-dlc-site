import { NextResponse } from "next/server";
import { query, queryAll } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { admin_token, action, user_id, role, ban_reason, days } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    if (action === "list") {
      const users = await queryAll("SELECT id, username, email, role, subscription_end, hwid, is_admin, banned, ban_reason, created_at FROM users ORDER BY id");
      return NextResponse.json({ ok: true, users });
    }

    if (action === "set-role") {
      if (!user_id || !role) return NextResponse.json({ error: "Укажите user_id и role" }, { status: 400 });
      const validRoles = ["user", "media", "tester", "admin"];
      if (!validRoles.includes(role)) return NextResponse.json({ error: `Роль должна быть: ${validRoles.join(", ")}` }, { status: 400 });
      const isAdmin = role === "admin" ? 1 : 0;
      await query("UPDATE users SET is_admin = $1, role = $2 WHERE id = $3", [isAdmin, role, user_id]);
      return NextResponse.json({ ok: true });
    }

    if (action === "ban") {
      if (!user_id) return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      await query("UPDATE users SET banned = 1, ban_reason = $1 WHERE id = $2", [ban_reason || null, user_id]);
      await query("DELETE FROM sessions WHERE user_id = $1", [user_id]);
      return NextResponse.json({ ok: true });
    }

    if (action === "unban") {
      if (!user_id) return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      await query("UPDATE users SET banned = 0, ban_reason = NULL WHERE id = $1", [user_id]);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      if (!user_id) return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      await query("DELETE FROM sessions WHERE user_id = $1", [user_id]);
      await query("DELETE FROM users WHERE id = $1", [user_id]);
      return NextResponse.json({ ok: true });
    }

    if (action === "reduce-subscription") {
      if (!user_id) return NextResponse.json({ error: "Укажите user_id" }, { status: 400 });
      if (!days || days < 1) return NextResponse.json({ error: "Укажите количество дней" }, { status: 400 });
      const user = await queryAll("SELECT subscription_end FROM users WHERE id = $1", [user_id]);
      if (!user.length || !(user[0] as any).subscription_end) return NextResponse.json({ error: "У пользователя нет подписки" }, { status: 400 });
      const current = new Date((user[0] as any).subscription_end.replace(" ", "T"));
      current.setDate(current.getDate() - days);
      const newEnd = current.toISOString().slice(0, 19).replace("T", " ");
      await query("UPDATE users SET subscription_end = $1 WHERE id = $2", [newEnd, user_id]);
      return NextResponse.json({ ok: true, subscription_end: newEnd });
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
