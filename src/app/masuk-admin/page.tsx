"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  Shield,
  Lock,
  Mail,
} from "lucide-react";
import { setSession, getDashboardPath, User } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthBgImage } from "@/lib/heroImageStore";

const DEMO = { email: "admin@idmap.id", password: "admin123" };

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f3d2e] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
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
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const DEFAULT_BG = "/images/hero-mangrove.webp";
  const [bgImage, setBgImage] = useState(DEFAULT_BG);

  useEffect(() => {
    getAuthBgImage()
      .then((img) => {
        if (img) setBgImage(img);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("Email dan password harus diisi.", "Email and password are required."));
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
        if (normalizedEmail === DEMO.email && password === DEMO.password) {
          user = (await tryRegister()) ?? (await tryLogin(DEMO.email, DEMO.password));
        }
      }

      if (!user) {
        setError(t("Email atau password salah.", "Invalid email or password."));
        return;
      }

      if (user.role !== "admin") {
        setError(
          t(
            "Akun ini tidak memiliki akses administrator.",
            "This account does not have administrator access."
          )
        );
        return;
      }

      setSession(user);
      router.push(safeNext ?? getDashboardPath(user.role));
    } catch {
      setError(t("Terjadi kesalahan. Silakan coba lagi.", "An error occurred. Please try again."));
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
    <div className="min-h-screen flex">
      {/* Left Panel — Branding / Illustration */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(6,45,34,.80) 0%, rgba(15,61,46,.60) 50%, rgba(26,92,68,.40) 100%), url('${bgImage}')`,
        }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/" className="inline-flex items-center justify-center group">
            <img
              src="/images/logo2.webp"
              alt="ID-MAP"
              className="w-14 h-14 rounded-full object-contain bg-white/95 shadow-lg group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/15">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-medium text-white/90">
                {t(
                  "Platform Integrasi Data Ekosistem Pesisir Berkelanjutan",
                  "Integrated Coastal Ecosystem Data Platform for Sustainability"
                )}
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {t("Satu Platform.", "One Platform.")}<br />
              {t("Seluruh Ekosistem Mangrove & Pesisir", "The Entire Mangrove & Coastal Ecosystem")}<br />
              <span className="text-emerald-300">{t("Indonesia.", "Indonesia.")}</span>
            </h2>

            <p className="text-base text-white/70 max-w-sm leading-relaxed">
              {t(
                "Data terintegrasi untuk pemantauan restorasi lingkungan, rehabilitasi, dan keberlanjutan pesisir nusantara.",
                "Integrated data for environmental restoration monitoring, rehabilitation, and coastal sustainability of the archipelago."
              )}
            </p>

            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-extrabold text-white">12K+</div>
                <div className="text-xs text-white/50 mt-0.5">{t("Hektar Terestorasi", "Hectares Restored")}</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-300">500+</div>
                <div className="text-xs text-white/50 mt-0.5">{t("Mitra Aktif", "Active Partners")}</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">8.5K</div>
                <div className="text-xs text-white/50 mt-0.5">{t("Kredit Karbon", "Carbon Credits")}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <p className="text-sm text-white/80 italic leading-relaxed">
              &ldquo;{t(
                "ID-MAP memudahkan kami memantau proyek restorasi mangrove secara real-time dan transparan.",
                "ID-MAP makes it easy for us to monitor mangrove restoration projects in real-time and transparently."
              )}&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300 text-xs font-bold">
                DR
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Dr. Rina S.</div>
                <div className="text-xs text-white/50">
                  {t("Direktur, Yayasan Mangrove Indonesia", "Director, Indonesia Mangrove Foundation")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="inline-flex items-center gap-2 lg:hidden" aria-label="Beranda ID-MAP">
            <div className="w-9 h-9 bg-[#0f3d2e] rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-lg text-[#0f3d2e]">ID-MAP</span>
          </Link>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
            <Globe className="w-3.5 h-3.5 text-gray-400 ml-2" />
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                language === "en"
                  ? "bg-[#0f3d2e] text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("id")}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                language === "id"
                  ? "bg-[#0f3d2e] text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              ID
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 pb-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {t("Selamat Datang Kembali", "Welcome Back")} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {t(
                  "Masuk ke konsol Administrator untuk mengelola pengguna, proyek, dan konfigurasi sistem.",
                  "Sign in to the Administrator console to manage users, projects, and system configuration."
                )}
              </p>
            </div>

            {/* Single role badge — no tabs */}
            <div className="flex items-center justify-center mb-6 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-full py-2.5 text-sm font-semibold rounded-lg bg-[#0f3d2e] text-white text-center shadow-lg shadow-emerald-900/20">
                {t("Administrator", "Administrator")}
              </div>
            </div>

            {/* Role description hint */}
            <div className="flex items-center gap-2 px-3 py-2 mb-5 bg-amber-50/70 border border-amber-100 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                {t(
                  "Akses penuh: pengguna, proyek, transaksi, dan analitik",
                  "Full access: users, projects, transactions, and analytics"
                )}
              </p>
            </div>

            {error && (
              <div
                id="login-error"
                role="alert"
                aria-live="assertive"
                className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 border border-red-100 flex items-start gap-2"
              >
                <span className="text-red-400 mt-0.5" aria-hidden="true">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="login-email" className="text-sm font-semibold text-gray-700 block mb-1.5">
                  {t("Alamat Email", "Email Address")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("nama@email.com", "name@email.com")}
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error" : undefined}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 transition-shadow hover:shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="text-sm font-semibold text-gray-700">
                    {t("Kata Sandi", "Password")}
                  </label>
                  <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    {t("Lupa password?", "Forgot password?")}
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Masukkan kata sandi", "Enter your password")}
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error" : undefined}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 transition-shadow hover:shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label={showPassword ? t("Sembunyikan password", "Hide password") : t("Tampilkan password", "Show password")}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600">
                  {t("Ingat saya", "Remember me")}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex items-center justify-center gap-2 w-full py-3 bg-[#0f3d2e] text-white font-bold rounded-xl hover:bg-[#14523d] transition-all text-sm shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("Memproses...", "Processing...")}
                  </>
                ) : (
                  <>
                    {t("Masuk", "Log In")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo account section */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("Demo Akun", "Demo Account")}
                </p>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                  {t("Admin", "Admin")}
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono text-gray-600">{DEMO.email}</span>
                  <span className="text-xs font-mono text-gray-400">{DEMO.password}</span>
                </div>
                <button
                  onClick={fillDemo}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                >
                  {t("Isi Otomatis", "Auto-fill")}
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              {t("Bukan administrator?", "Not an administrator?")}{" "}
              <Link href="/masuk" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                {t("Masuk sebagai Sahabat / Mitra", "Sign in as Sahabat / Partner")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
