"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  Shield,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
  Server,
  Users,
  BarChart3,
} from "lucide-react";
import { setSession, getDashboardPath, User } from "@/lib/auth";

const DEMO = { email: "admin@idmap.id", password: "admin123" };

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-amber-300/30 border-t-amber-300 animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : null;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().toLowerCase();

      const tryLogin = async (em: string, pw: string) => {
        const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email: em, password: pw }),
        });
        if (!r.ok) return null;
        const data = await r.json().catch(() => null);
        return (data?.user as User | null) ?? null;
      };
      const tryRegister = async () => {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            email: DEMO.email,
            password: DEMO.password,
            name: "Admin ID-MAP",
            role: "admin",
          }),
        });
        if (!r.ok) return null;
        const data = await r.json().catch(() => null);
        return (data?.user as User | null) ?? null;
      };

      let user = await tryLogin(normalizedEmail, password);

      if (!user) {
        if (
          normalizedEmail === DEMO.email &&
          password === DEMO.password
        ) {
          user = (await tryRegister()) ?? (await tryLogin(DEMO.email, DEMO.password));
        }
      }

      if (!user) {
        setError("Kredensial tidak valid. Verifikasi akun administrator Anda.");
        return;
      }

      if (user.role !== "admin") {
        setError("Akun ini tidak memiliki akses administrator.");
        return;
      }

      setSession(user);
      router.push(safeNext ?? getDashboardPath(user.role));
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Subtle ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 w-[28rem] h-[28rem] rounded-full bg-rose-500/[0.07] blur-[120px]" />
      </div>

      {/* Diagonal stripes */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 22px)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-amber-300/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Admin Console</span>
          </div>
        </header>

        {/* Card centered */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-[460px]">
            {/* Brand badge */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl shadow-black/50 ring-1 ring-amber-400/40">
                  <Shield className="w-8 h-8 text-amber-300" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/[0.08] border border-amber-400/20 text-amber-200 text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
                <KeyRound className="w-3 h-3" />
                Restricted · Level 1
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Administrator Sign-in
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Akses penuh ke konsol manajemen ID-MAP. Setiap aktivitas dicatat dan ditinjau berkala.
              </p>
            </div>

            {/* Card */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Top gradient accent */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

              <div className="p-6 sm:p-7">
                {/* Console capability row */}
                <div className="grid grid-cols-3 gap-2 mb-6 pb-6 border-b border-white/5">
                  <CapabilityChip icon={<Server className="w-3.5 h-3.5" />} label="Sistem" />
                  <CapabilityChip icon={<Users className="w-3.5 h-3.5" />} label="Pengguna" />
                  <CapabilityChip icon={<BarChart3 className="w-3.5 h-3.5" />} label="Analitik" />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="adm-email"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] block mb-1.5"
                    >
                      Email Administrator
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="adm-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@idmap.id"
                        autoComplete="username"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="adm-password"
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]"
                      >
                        Kata Sandi
                      </label>
                      <a
                        href="#"
                        className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                      >
                        Reset?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="adm-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        className="w-full pl-10 pr-12 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-white/20 bg-slate-950 text-amber-400 focus:ring-amber-400/50"
                    />
                    Sesi tepercaya pada perangkat ini
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex items-center justify-center gap-2 w-full py-3 mt-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-900/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        Mengautentikasi...
                      </>
                    ) : (
                      <>
                        Otentikasi & Masuk
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo */}
                <div className="mt-5 p-3.5 rounded-xl bg-amber-400/[0.04] border border-amber-400/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                      Akun Demo
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded-full border border-rose-400/20">
                      ADMIN
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-mono text-amber-100 truncate">
                        {DEMO.email}
                      </span>
                      <span className="text-xs font-mono text-amber-100/40">
                        {DEMO.password}
                      </span>
                    </div>
                    <button
                      onClick={fillDemo}
                      className="shrink-0 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-300 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      Isi Otomatis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-500/[0.04] border border-rose-500/15">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300/80 mt-0.5 shrink-0" />
              <p className="text-[11px] text-rose-100/60 leading-relaxed">
                Halaman ini hanya untuk administrator yang berwenang. Percobaan login dipantau dan dapat memicu penguncian otomatis.
              </p>
            </div>
          </div>
        </main>

        <footer className="px-6 sm:px-10 py-5 border-t border-white/5 text-center text-[11px] font-mono text-slate-600 tracking-wider">
          ID-MAP / ADMIN-CONSOLE / v2.0 · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function CapabilityChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-amber-300/80">
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
