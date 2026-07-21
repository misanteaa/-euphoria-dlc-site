import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { action, key_id, admin_token } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    if (action === "delete" && key_id) {
      db.prepare("DELETE FROM keys WHERE id = ? AND activated_by IS NULL").run(key_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-used" && key_id) {
      db.prepare("DELETE FROM keys WHERE id = ?").run(key_id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
