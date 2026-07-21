import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { action, admin_token, ...params } = await req.json();

    if (admin_token !== "euphoria-admin-2024") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    switch (action) {
      case "list-users": {
        const users = db.prepare(
          "SELECT id, username, email, role, banned, is_admin, beta_access, subscription_end FROM users ORDER BY id"
        ).all();
        return NextResponse.json({ success: true, users });
      }

      case "set-role": {
        const { username, role } = params;
        if (!username || !role) return NextResponse.json({ success: false, error: "Missing params" });
        if (username === "werts") return NextResponse.json({ success: false, error: "Cannot change owner role" });
        const isAdmin = role === "admin" ? 1 : 0;
        db.prepare("UPDATE users SET role = ?, is_admin = ? WHERE username = ?").run(role, isAdmin, username);
        return NextResponse.json({ success: true });
      }

      case "set-ban": {
        const { username, banned } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        if (username === "werts") return NextResponse.json({ success: false, error: "Cannot ban owner" });
        db.prepare("UPDATE users SET banned = ? WHERE username = ?").run(banned ? 1 : 0, username);
        if (banned) db.prepare("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = ?)").run(username);
        return NextResponse.json({ success: true });
      }

      case "set-beta": {
        const { username, beta_access } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        db.prepare("UPDATE users SET is_admin = ? WHERE username = ?").run(beta_access ? 1 : 0, username);
        return NextResponse.json({ success: true });
      }

      case "delete-user": {
        const { username } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        if (username === "werts") return NextResponse.json({ success: false, error: "Cannot delete owner" });
        db.prepare("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = ?)").run(username);
        db.prepare("DELETE FROM users WHERE username = ?").run(username);
        return NextResponse.json({ success: true });
      }

      case "change-password": {
        const { username, newPassword } = params;
        if (!username || !newPassword || newPassword.length < 4) {
          return NextResponse.json({ success: false, error: "Password min 4 chars" });
        }
        const bcrypt = require("bcrypt");
        const hash = bcrypt.hashSync(newPassword, 10);
        db.prepare("UPDATE users SET password = ? WHERE username = ?").run(hash, username);
        return NextResponse.json({ success: true });
      }

      case "media-stats": {
        const { username } = params;
        if (!username) return NextResponse.json({ success: false, error: "Missing username" });
        const user = db.prepare("SELECT id, username, role, is_admin FROM users WHERE username = ?").get(username) as any;
        if (!user) return NextResponse.json({ success: false, error: "User not found" });
        const totalUsers = (db.prepare("SELECT COUNT(*) as cnt FROM users").get() as any).cnt;
        const referredByUser = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = ?").get(user.username) as any).cnt;
        return NextResponse.json({
          success: true,
          username: user.username,
          role: user.role,
          totalUsers,
          referralCount: referredByUser,
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}
