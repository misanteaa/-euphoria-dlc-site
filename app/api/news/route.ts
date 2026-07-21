import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const news = db.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 20").all();
    return NextResponse.json({ ok: true, news });
  } catch {
    return NextResponse.json({ ok: true, news: [] });
  }
}
