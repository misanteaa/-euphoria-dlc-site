import { NextResponse } from "next/server";
import crypto from "crypto";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { action, key_id, admin_token } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ error: "Неверный токен" }, { status: 403 });
    }

    if (action === "list") {
      const keys = (await query("SELECT * FROM keys ORDER BY created_at DESC")).rows;
      return NextResponse.json({ ok: true, keys });
    }

    if (action === "delete" && key_id) {
      await query("DELETE FROM keys WHERE id = $1 AND activated_by IS NULL", [key_id]);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-used" && key_id) {
      await query("DELETE FROM keys WHERE id = $1", [key_id]);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
