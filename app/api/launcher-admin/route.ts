import { NextResponse } from "next/server";
import { query, queryOne, queryAll } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { action, admin_token, ...params } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    switch (action) {
      case "list-users": {
        const users = await queryAll(
          "SELECT id, username, email, role, banned, is_admin, beta_access, subscription_end FROM users ORDER BY id"
        );
        return NextResponse.json({ success: true, users });
      }

      case "set-role": {
        const { username, role } = params;
        if (!username || !role) return NextResponse.json({ success: false, error: "Missing params" });
        if (username === "werts") return NextResponse.json({ success: false, error: "Cannot change owner role" });
        const isAdmin = role === "admin" ? 1 : 0;
        await query("UPDATE users SET role = $1, is_admin = $2 WHERE username = $3", [role, isAdmin, username]);
        return NextResponse.json({ success: true });
      }

      case "set-ban": {
        const { username, banned } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        if (username === "werts") return NextResponse.json({ success: false, error: "Cannot ban owner" });
        await query("UPDATE users SET banned = $1 WHERE username = $2", [banned ? 1 : 0, username]);
        if (banned) {
          await query("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = $1)", [username]);
        }
        return NextResponse.json({ success: true });
      }

      case "set-beta": {
        const { username, beta_access } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        await query("UPDATE users SET is_admin = $1 WHERE username = $2", [beta_access ? 1 : 0, username]);
        return NextResponse.json({ success: true });
      }

      case "delete-user": {
        const { username } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        if (username === "werts") return NextResponse.json({ success: false, error: "Cannot delete owner" });
        await query("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = $1)", [username]);
        await query("DELETE FROM users WHERE username = $1", [username]);
        return NextResponse.json({ success: true });
      }

      case "change-password": {
        const { username, newPassword } = params;
        if (!username || !newPassword || newPassword.length < 4) {
          return NextResponse.json({ success: false, error: "Password min 4 chars" });
        }
        const bcrypt = require("bcrypt");
        const hash = bcrypt.hashSync(newPassword, 10);
        await query("UPDATE users SET password = $1 WHERE username = $2", [hash, username]);
        return NextResponse.json({ success: true });
      }

      case "media-stats": {
        const { username } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        const user = await queryOne("SELECT id, username, role, is_admin FROM users WHERE username = $1", [username]) as any;
        if (!user) return NextResponse.json({ success: false, error: "User not found" });
        const totalResult = await queryOne("SELECT COUNT(*) as cnt FROM users");
        const referredResult = await queryOne("SELECT COUNT(*) as cnt FROM users WHERE role = $1", [user.username]);
        return NextResponse.json({
          success: true,
          username: user.username,
          role: user.role,
          totalUsers: totalResult?.cnt ?? 0,
          referralCount: referredResult?.cnt ?? 0,
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}
