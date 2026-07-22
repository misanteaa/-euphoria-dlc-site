import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
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
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const user = await queryOne("SELECT id, username, subscription_end FROM users WHERE username = $1", [username]) as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasSub = user.subscription_end && new Date(user.subscription_end.replace(" ", "T")) > new Date();
    if (!hasSub) {
      return NextResponse.json({ ok: true, token: "" });
    }

    const token = signToken(user.id, user.username);
    return NextResponse.json({ ok: true, token, userId: user.id, username: user.username });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}