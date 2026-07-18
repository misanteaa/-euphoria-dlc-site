import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 — нативный модуль, его нельзя бандлить, помечаем как external
  serverExternalPackages: ["better-sqlite3", "bcrypt"],
};

export default nextConfig;
