import { NextResponse } from "next/server";
import { queryAll } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const news = await queryAll("SELECT * FROM news ORDER BY created_at DESC LIMIT 20");
    return NextResponse.json({ ok: true, news });
  } catch {
    return NextResponse.json({ ok: true, news: [] });
  }
}
