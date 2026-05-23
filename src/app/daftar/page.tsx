"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { setSession, getDashboardPath, User } from "@/lib/auth";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthBgImage } from "@/lib/heroImageStore";

const roles = ["komunitas", "mitra"] as const;
type Role = (typeof roles)[number];

// ─── Inner form — uses useSearchParams, must be inside <Suspense> ────────────
function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const createMutation = useMutation(api.users.create);
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);

  // Pre-select role from ?peran= URL param (e.g. /daftar?peran=mitra)
  const getInitialRole = (): Role => {
    const peran = searchParams.get("peran");
    if (peran === "mitra" || peran === "komunitas") return peran;
    return "komunitas";
  };

  const [role, setRole] = useState<Role>(getInitialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    getAuthBgImage().then((img) => {
      setBgImage(img || "/images/hero-mangrove.png");
    });
  }, []);

  const roleLabels: Record<Role, string> = {
    komunitas: t("Komunitas", "Community"),
    mitra: t("Mitra", "Partner"),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError(t("Semua field harus diisi.", "All fields are required."));
      return;
    }

    if (password.length < 6) {
      setError(t("Password minimal 6 karakter.", "Password must be at least 6 characters."));
      return;
    }

    try {
      setIsLoading(true);
      const userId = await createMutation({
        email,
        password,
        name,
        role,
      });

      setSession({
        _id: userId,
        email,
        name,
        role,
      });
      router.push(getDashboardPath(role));
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes("Email sudah terdaftar") ||
          err.message.includes("DUPLICATE_EMAIL"))
      ) {
        setError(
          t(
            "Email sudah terdaftar. Silakan gunakan email lain atau masuk.",
            "Email is already registered. Please use another email or log in."
          )
        );
      } else {
        setError(t("Terjadi kesalahan. Silakan coba lagi.", "An error occurred. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!bgImage) {
    return (
      <div className="min-h-screen bg-[#0f3d2e] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Overlay with slight blur for better readability */}
      <div className="absolute inset-0 bg-[#0f3d2e]/50 backdrop-blur-[2px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/10">
              <Leaf className="w-6 h-6 text-emerald-800" />
            </div>
            <span className="font-display font-bold text-3xl text-white drop-shadow-md tracking-tight">
              ID-MAP
            </span>
          </Link>
          <p className="text-sm font-medium text-emerald-50 mt-2 drop-shadow-sm">{t("Buat akun baru", "Create a new account")}</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8">
          {/* Role tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(""); }}
                aria-pressed={role === r}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  role === r
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>

          {error && (
            <div id="register-error" role="alert" aria-live="assertive" className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4 flex items-center gap-2">
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="register-name" className="text-sm font-medium text-gray-700 block mb-1">
                {role === "mitra"
                  ? t("Nama Organisasi / Mitra", "Organization / Partner Name")
                  : t("Nama Lengkap", "Full Name")}
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
                placeholder={
                  role === "mitra"
                    ? t("Nama organisasi atau lembaga", "Organization or institution name")
                    : t("Nama lengkap Anda", "Your full name")
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>


            {role === "mitra" && (
              <>
                <div>
                  <label htmlFor="register-partner-type" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("Jenis Mitra", "Partner Type")}
                  </label>
                  <select id="register-partner-type" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                    <option value="">{t("Pilih jenis mitra", "Select partner type")}</option>
                    <option value="ngo">{t("NGO / Lembaga Nirlaba", "NGO / Non-profit")}</option>
                    <option value="developer">{t("Project Developer", "Project Developer")}</option>
                    <option value="pemerintah">{t("Instansi Pemerintah", "Government Institution")}</option>
                    <option value="akademisi">{t("Akademisi / Peneliti", "Academic / Researcher")}</option>
                    <option value="koperasi">{t("Koperasi / Kelompok Tani", "Cooperative / Farmer Group")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="register-location" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("Lokasi Proyek", "Project Location")}
                  </label>
                  <input
                    id="register-location"
                    type="text"
                    placeholder={t("Kabupaten / Kota, Provinsi", "Regency / City, Province")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="register-password" className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "register-error" : undefined}
                  placeholder={t("Buat password (min. 6 karakter)", "Create password (min. 6 characters)")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("Sembunyikan password", "Hide password") : t("Tampilkan password", "Show password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="register-terms" className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  id="register-terms"
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <span>
                  {t("Saya menyetujui", "I agree to the")}{" "}
                  <a href="#" className="text-emerald-600">{t("Syarat & Ketentuan", "Terms & Conditions")}</a>{" "}
                  {t("dan", "and")}{" "}
                  <a href="#" className="text-emerald-600">{t("Kebijakan Privasi", "Privacy Policy")}</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="block w-full py-2.5 bg-emerald-900 text-white font-display font-semibold rounded-lg hover:bg-emerald-800 transition-colors text-sm text-center disabled:opacity-70"
            >
              {isLoading ? t("Mendaftar...", "Registering...") : t("Daftar", "Register")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("Sudah punya akun?", "Already have an account?")}{" "}
            <Link href="/masuk" className="text-emerald-600 font-semibold hover:text-emerald-700">
              {t("Masuk", "Log In")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page export — wraps form in Suspense for useSearchParams ────────────────
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f3d2e] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
