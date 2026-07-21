"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Clock,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

type Me = { id: number; username: string; email: string; role: string; balance: number } | null;
type Submission = { id: number; video_url: string; status: string; reward: number; admin_note: string | null; created_at: string };

export default function MediaPage() {
  const router = useRouter();
  const [user, setUser] = useState<Me>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.replace("/login");
        else {
          setUser(data.user);
          loadSubmissions();
        }
      });
  }, [router]);

  async function loadSubmissions() {
    try {
      const res = await fetch("/api/media-submit");
      const data = await res.json();
      if (data.submissions) setSubmissions(data.submissions);
    } catch {}
  }

  async function submitVideo() {
    if (!videoUrl.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/media-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Ошибка");
        return;
      }
      setMsg("Заявка отправлена ✓");
      setVideoUrl("");
      loadSubmissions();
    } catch {
      setMsg("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  function statusIcon(s: string) {
    if (s === "approved") return <CheckCircle size={16} className="text-green-400" />;
    if (s === "rejected") return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-yellow-400" />;
  }

  function statusText(s: string) {
    if (s === "approved") return "Одобрено";
    if (s === "rejected") return "Отклонено";
    return "На рассмотрении";
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="relative min-h-screen text-white overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
          <Image src="/fluid2.png" alt="" fill className="object-cover" priority />
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-white/50 hover:text-white/80 mb-6 transition">
            <ArrowLeft size={18} /> Назад
          </button>

          <h1 className="text-3xl font-bold mb-2">Медиа</h1>
          <p className="text-white/40 mb-8">Отправляй ссылки на видео и получай баланс</p>

          {user.role === "media" && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-7 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PaperPlaneTilt size={22} /> Отправить видео
              </h2>

              <div className="flex gap-3">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-black/40 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500 outline-none"
                />
                <button
                  onClick={submitVideo}
                  disabled={loading || !videoUrl.trim()}
                  className="px-6 py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {loading ? "..." : "Отправить"}
                </button>
              </div>

              {msg && (
                <p className={`mt-3 text-sm ${msg.includes("✓") ? "text-green-400" : "text-red-400"}`}>{msg}</p>
              )}
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-7">
            <h2 className="text-xl font-bold mb-4">Мои заявки</h2>

            {submissions.length === 0 ? (
              <p className="text-white/30 text-center py-6">Нет заявок</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((s) => (
                  <div key={s.id} className="bg-black/30 rounded-xl p-4 border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <a href={s.video_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm truncate block">
                        {s.video_url}
                      </a>
                      <p className="text-white/30 text-xs mt-1">{new Date(s.created_at).toLocaleDateString("ru-RU")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "approved" && s.reward > 0 && (
                        <span className="text-green-400 text-sm font-semibold">+{s.reward} ₽</span>
                      )}
                      <span className="flex items-center gap-1 text-xs">
                        {statusIcon(s.status)}
                        <span className="text-white/50">{statusText(s.status)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}