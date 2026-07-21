"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import {
  SignOut,
  ShoppingCartSimple,
  CalendarBlank,
  Key,
  Hash,
  Fingerprint,
  Cube,
  DownloadSimple,
  ArrowUpRight,
  ShieldCheck,
  Shield,
  User,
} from "@phosphor-icons/react";

type Me = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  subscription_end: string | null;
  hwid: string | null;
  role: string;
  is_admin: number;
} | null;

// Простой стабильный хеш (для наглядного HWID из данных аккаунта)
function makeHwid(seed: string) {
  let h1 = 0x811c9dc5;
  let out = "";
  for (let pass = 0; pass < 4; pass++) {
    let h = h1 ^ (pass * 0x9e3779b1);
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    out += (h >>> 0).toString(16).padStart(8, "0");
    h1 = h;
  }
  return out;
}

function formatDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<Me>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.replace("/login");
        else setUser(data.user);
      });
  }, [router]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Производные данные аккаунта
  const reg = user ? new Date(user.created_at.replace(" ", "T")) : new Date();
  const regStr = user ? formatDate(reg) : "—";
  const subEnd = user?.subscription_end ? new Date(user.subscription_end.replace(" ", "T")) : null;
  const now = new Date();
  const hasSub = subEnd && subEnd > now;
  const subStr = user ? (hasSub ? formatDate(subEnd) : "Нет подписки") : "—";
  const hwid = user?.hwid ?? "—";

  const roleLabels: Record<string, string> = {
    user: "Пользователь",
    media: "Медиа",
    tester: "Тестер",
    admin: "Администратор",
  };

  return (
    <>
      <Loader onFinished={() => setReady(true)} />
      {ready && (
        <>
          <Header />

          <main className="relative min-h-screen text-white overflow-hidden">
            {/* Фоновая дымка */}
            <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
              <Image
                src="/fluid2.png"
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/70 to-black pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 pt-36 pb-24">
              {/* Заголовок + выйти */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-white/40 text-xs tracking-widest uppercase mb-2">
                    Личный кабинет
                  </p>
                  <h1 className="text-5xl font-extrabold">Профиль</h1>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  <SignOut size={18} weight="bold" />
                  Выйти
                </button>
              </div>

              {/* Карточка пользователя */}
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-7 mb-12 overflow-hidden">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-white/15 shrink-0">
                      <Image
                        src="/icon.png"
                        alt="avatar"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold leading-none mb-1">
                        {user?.username ?? "..."}
                      </h2>
                      <p className="text-white/50 text-sm mb-3">
                        {user?.email ?? ""}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                          <ShieldCheck size={14} />
                          {roleLabels[user?.role || "user"]}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                          <Hash size={14} />
                          UID {user?.id ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs tracking-widest uppercase mb-1">
                      Подписка
                    </p>
                    <p className="text-xl font-semibold">{subStr}</p>
                  </div>
                </div>
              </div>

              {/* Аккаунт */}
              <div className="mb-12">
                <h3 className="text-3xl font-bold mb-1">Аккаунт</h3>
                <p className="text-white/40 mb-6">
                  Подписка, доступ и состояние защиты аккаунта.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <InfoTile
                    icon={<ShoppingCartSimple size={18} />}
                    label="Подписка"
                    value={subStr}
                  />
                  <InfoTile
                    icon={<CalendarBlank size={18} />}
                    label="Регистрация"
                    value={regStr}
                  />
                  <InfoTile
                    icon={<Key size={18} />}
                    label="Доступ"
                    value="Активен"
                  />
                  <InfoTile
                    icon={<Hash size={18} />}
                    label="UID"
                    value={String(user?.id ?? "—")}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                    <Fingerprint size={18} />
                    HWID
                  </div>
                  <p className="font-mono text-lg break-all">{hwid}</p>
                </div>
              </div>

              {/* Действия */}
              <div>
                <h3 className="text-3xl font-bold mb-1">Действия</h3>
                <p className="text-white/40 mb-6">
                  Быстрые переходы в нужные разделы.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionCard
                    href="/pricing"
                    icon={<ShoppingCartSimple size={22} />}
                    title="Продукты"
                    desc="Подписки и товары"
                  />
                  <ActionCard
                    href="/dashboard/addons"
                    icon={<Cube size={22} />}
                    title="Дополнения"
                    desc="Ключ и смена пароля"
                  />
                  {hasSub ? (
                    <ActionCard
                      href="https://drive.google.com/uc?export=download&id=1aTDsNJiaJVAYsJ7WYJUnR6PUQ0I7oMZV"
                      icon={<DownloadSimple size={22} />}
                      title="Скачать лаунчер"
                      desc="Загрузить последнюю версию"
                    />
                  ) : (
                    <ActionCard
                      href="/pricing"
                      icon={<ShoppingCartSimple size={22} />}
                      title="Скачать лаунчер"
                      desc="Требуется подписка"
                    />
                  )}
                  {user?.role === "admin" && (
                    <ActionCard
                      href="/dashboard/admin"
                      icon={<Shield size={22} />}
                      title="Админ панель"
                      desc="Управление пользователями и ключами"
                    />
                  )}
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </>
      )}
    </>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center mb-4 text-white/70">
        {icon}
      </div>
      <p className="text-white/40 text-sm mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <Link
        href={href}
        className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition p-6 overflow-hidden"
      >
        <div className="relative flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white/70 group-hover:text-purple-300 transition">
            {icon}
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-white/40 text-sm">{desc}</p>
          </div>
        </div>
        <ArrowUpRight
          size={20}
          className="relative text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
        />
      </Link>
    </motion.div>
  );
}
