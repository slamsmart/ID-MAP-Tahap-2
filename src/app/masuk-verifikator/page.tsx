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
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
  ArrowLeft,
  Database,
  ClipboardCheck,
  Activity,
} from "lucide-react";
import { setSession, getDashboardPath, User } from "@/lib/auth";

const DEMO = { email: "verifikator@idmap.id", password: "verif123" };

export default function VerifikatorLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#062d22] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-300/30 border-t-emerald-300 animate-spin" />
        </div>
      }
    >
      <VerifikatorLoginForm />
    </Suspense>
  );
}

function VerifikatorLoginForm() {
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
            name: "Tim Verifikator Pesisir",
            role: "verifikator",
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
        setError("Email atau kata sandi salah. Pastikan akun Anda terdaftar sebagai Verifikator.");
        return;
      }

      if (user.role !== "verifikator" && user.role !== "admin") {
        setError("Akun ini bukan akun Verifikator. Gunakan portal yang sesuai.");
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
    <div className="min-h-screen bg-[#062d22] relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-emerald-400/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[24rem] h-[24rem] rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[22rem] h-[22rem] rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-200/80">
            <Activity className="w-3.5 h-3.5" />
            <span>Portal Verifikator · ID-MAP</span>
          </div>
        </header>

        {/* Card centered */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-[460px]">
            {/* Brand badge */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-300/30 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-900/40 ring-1 ring-white/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-300/20 text-emerald-200 text-[11px] font-semibold tracking-wider uppercase mb-3">
                <Fingerprint className="w-3 h-3" />
                Akses Terverifikasi
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Portal Verifikator
              </h1>
              <p className="text-sm text-emerald-100/60 mt-2 max-w-sm mx-auto leading-relaxed">
                Validasi data abrasi pantai, populasi penyu, dan laporan POKMASWAS pesisir nusantara.
              </p>
            </div>

            {/* Glass card */}
            <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/30">
              {/* Trust indicators row */}
              <div className="grid grid-cols-3 gap-2 mb-6 pb-6 border-b border-white/10">
                <TrustChip icon={<Database className="w-3.5 h-3.5" />} label="Data Pesisir" />
                <TrustChip icon={<ClipboardCheck className="w-3.5 h-3.5" />} label="Audit Trail" />
                <TrustChip icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Sertifikasi" />
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-red-200 text-xs flex items-start gap-2"
                >
                  <span aria-hidden>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="ver-email"
                    className="text-xs font-bold text-emerald-100/80 uppercase tracking-wider block mb-1.5"
                  >
                    Email Verifikator
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200/50" />
                    <input
                      id="ver-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@idmap.id"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="ver-password"
                      className="text-xs font-bold text-emerald-100/80 uppercase tracking-wider"
                    >
                      Kata Sandi
                    </label>
                    <a
                      href="#"
                      className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      Lupa kata sandi?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200/50" />
                    <input
                      id="ver-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white transition-colors"
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

                <label className="flex items-center gap-2 text-xs text-emerald-100/70 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-400/50"
                  />
                  Tetap masuk di perangkat ini
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex items-center justify-center gap-2 w-full py-3 mt-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-emerald-950 font-bold rounded-xl text-sm shadow-xl shadow-emerald-900/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      Masuk Sebagai Verifikator
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo */}
              <div className="mt-5 p-3.5 rounded-xl bg-emerald-300/[0.06] border border-emerald-300/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                    Akun Demo
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-400/15 text-emerald-200 rounded-full border border-emerald-300/20">
                    Verifikator
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-mono text-emerald-100 truncate">
                      {DEMO.email}
                    </span>
                    <span className="text-xs font-mono text-emerald-100/40">
                      {DEMO.password}
                    </span>
                  </div>
                  <button
                    onClick={fillDemo}
                    className="shrink-0 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    Isi Otomatis
                  </button>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-emerald-100/40 mt-6 leading-relaxed">
              Akses portal ini dibatasi untuk personel yang ditunjuk. Aktivitas dicatat dalam audit log.
            </p>
          </div>
        </main>

        <footer className="px-6 sm:px-10 py-5 text-center text-[11px] text-emerald-100/30">
          © ID-MAP {new Date().getFullYear()} · Integrated Coastal Ecosystem Data Platform
        </footer>
      </div>
    </div>
  );
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-300/20 flex items-center justify-center text-emerald-200">
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-emerald-100/70 leading-tight">
        {label}
      </span>
    </div>
  );
}
