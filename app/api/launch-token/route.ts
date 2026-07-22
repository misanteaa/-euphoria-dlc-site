import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const SECRET = "euphoria-launch-2024-secret";

export function signToken(userId: number, username: string): string {
  const payload = `${userId}:${username}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 16);
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

export function verifyToken(token: string): { valid: boolean; userId?: number } {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return { valid: false };

    const [userId, username, timestamp, sig] = parts;
    const payload = `${userId}:${username}:${timestamp}`;
    const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 16);

    if (sig !== expectedSig) return { valid: false };

    const age = Date.now() - Number(timestamp);
    if (age > 5 * 60 * 1000) return { valid: false };

    return { valid: true, userId: Number(userId) };
  } catch {
    return { valid: false };
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const token = signToken(user.id, user.username);

    return NextResponse.json({ ok: true, token, userId: user.id, username: user.username });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}