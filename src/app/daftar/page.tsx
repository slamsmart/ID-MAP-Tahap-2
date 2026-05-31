"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { setSession, getDashboardPath, User } from "@/lib/auth";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthBgImage } from "@/lib/heroImageStore";
import Turnstile from "@/components/shared/Turnstile";

const roles = ["sahabat", "mitra"] as const;
type Role = (typeof roles)[number];

// ─── Inner form — uses useSearchParams, must be inside <Suspense> ────────────
function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const verifyOtpMutation = useMutation(api.otpCodes.verifyOtp);
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpValue, setOtpValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Pre-select role from ?peran= URL param (e.g. /daftar?peran=mitra)
  const getInitialRole = (): Role => {
    const peran = searchParams.get("peran");
    if (peran === "mitra" || peran === "sahabat") return peran;
    return "sahabat";
  };

  const [role, setRole] = useState<Role>(getInitialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const DEFAULT_BG = "/images/hero-mangrove.webp";
  const [bgImage, setBgImage] = useState(DEFAULT_BG);

  useEffect(() => {
    getAuthBgImage()
      .then((img) => { if (img) setBgImage(img); })
      .catch(() => {}); // fallback ke default sudah di-set di useState
  }, []);

  const roleLabels: Record<Role, string> = {
    sahabat: t("Sahabat", "Sahabat"),
    mitra: t("Mitra", "Partner"),
  };

  // Step 1: validasi form → kirim OTP ke email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError(t("Semua field harus diisi.", "All fields are required."));
      return;
    }
    if (role === "sahabat" && (!phone || !address)) {
      setError(t("No HP dan alamat KTP wajib diisi untuk Sahabat Mangrove.", "Phone and KTP address are required for Sahabat Mangrove."));
      return;
    }
    if (password.length < 6) {
      setError(t("Password minimal 6 karakter.", "Password must be at least 6 characters."));
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("Gagal mengirim OTP.", "Failed to send OTP."));
        return;
      }
      setStep("otp");
      setOtpValue("");
      // Mulai cooldown 60 detik untuk tombol kirim ulang
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError(t("Koneksi gagal. Pastikan internet Anda aktif.", "Connection failed."));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: verifikasi OTP → buat akun → redirect
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otpValue.trim()) {
      setError(t("Masukkan kode OTP.", "Enter the OTP code."));
      return;
    }
    try {
      setIsLoading(true);
      await verifyOtpMutation({ email, code: otpValue.trim() });

      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          ...(phone ? { phone } : {}),
          ...(address ? { address } : {}),
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });
      if (!r.ok) {
        const errData = await r.json().catch(() => null);
        if (r.status === 409) {
          setError(t("Email sudah terdaftar. Silakan masuk.", "Email already registered. Please log in."));
        } else {
          setError(errData?.error ?? t("Gagal mendaftar.", "Failed to register."));
        }
        return;
      }
      const data = await r.json().catch(() => null);
      const newUser = (data?.user as User | null) ?? null;
      if (!newUser) {
        setError(t("Gagal mendaftar.", "Failed to register."));
        return;
      }
      setSession(newUser);
      const nextPath = searchParams.get("next");
      const safeNext = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : null;
      router.push(safeNext ?? getDashboardPath(role));
    } catch (err: any) {
      const msg =
        typeof err?.data === "string"
          ? err.data
          : (err?.data?.message ?? err?.message ?? "");
      if (msg.toLowerCase().includes("otp") || msg.includes("kode")) {
        setError(msg);
      } else {
        setError(t("Terjadi kesalahan. Silakan coba lagi.", "An error occurred. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Kirim ulang OTP (reuse handleSubmit logic)
  const handleResendOtp = async () => {
    setError("");
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("Gagal mengirim ulang OTP.", "Failed to resend OTP."));
        return;
      }
      setOtpValue("");
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError(t("Koneksi gagal.", "Connection failed."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Overlay with slight blur for better readability */}
      <div className="absolute inset-0 bg-[#0f3d2e]/50 backdrop-blur-[2px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <img
              src="/images/logo2.webp"
              alt="ID-MAP"
              className="w-20 h-20 rounded-full object-contain shadow-lg shadow-black/10 bg-white"
            />
          </Link>
          <p className="text-sm font-medium text-emerald-50 mt-2 drop-shadow-sm">{t("Buat akun baru", "Create a new account")}</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8">

          {/* ── Stepper 2-step (Form → OTP) ── */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "form" || step === "otp"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
                1
              </div>
              <span className={`text-xs font-semibold ${step === "form" ? "text-emerald-700" : "text-gray-400"}`}>
                {t("Isi Data", "Fill Data")}
              </span>
            </div>
            <div className={`flex-1 h-0.5 max-w-12 ${step === "otp" ? "bg-emerald-600" : "bg-gray-200"}`} />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "otp"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
              <span className={`text-xs font-semibold ${step === "otp" ? "text-emerald-700" : "text-gray-400"}`}>
                {t("Verifikasi OTP", "Verify OTP")}
              </span>
            </div>
          </div>

          {/* ── Step OTP ── */}
          {step === "otp" && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📧</span>
                </div>
                <h2 className="font-bold text-gray-900 text-lg">{t("Cek Email Anda", "Check Your Email")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("Kode OTP 6 digit dikirim ke", "6-digit OTP sent to")}{" "}
                  <span className="font-semibold text-emerald-700">{email}</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2">
                <span aria-hidden>📬</span>
                <span>
                  {t(
                    "Email tidak masuk? Mohon cek folder Spam / Promosi pada Gmail Anda.",
                    "Didn't receive it? Please check your Spam / Promotions folder."
                  )}
                </span>
              </div>

              {error && (
                <div role="alert" className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4 flex items-center gap-2">
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp-input" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("Kode OTP", "OTP Code")}
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, "")); setError(""); }}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpValue.length < 6}
                  className="block w-full py-2.5 bg-emerald-900 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors text-sm disabled:opacity-70"
                >
                  {isLoading ? t("Memverifikasi...", "Verifying...") : t("Verifikasi & Daftar", "Verify & Register")}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendCooldown > 0}
                  className="block w-full text-sm text-emerald-600 hover:text-emerald-700 text-center disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? t(`Kirim ulang dalam ${resendCooldown}s`, `Resend in ${resendCooldown}s`)
                    : t("Kirim ulang kode OTP", "Resend OTP code")}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setOtpValue(""); }}
                  className="block w-full text-sm text-gray-500 hover:text-gray-700 text-center"
                >
                  ← {t("Ganti email", "Change email")}
                </button>
              </form>
            </div>
          )}

          {/* ── Step Form ── */}
          {step === "form" && <>
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

            {role === "sahabat" && (
              <>
                <div>
                  <label htmlFor="register-phone" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("No. HP", "Phone Number")}
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="register-address" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("Alamat sesuai KTP", "Address (as on ID card)")}
                  </label>
                  <textarea
                    id="register-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder={t("Alamat lengkap sesuai KTP", "Full address as on ID card")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t(
                      "Untuk pencetakan sertifikat donasi. Tidak perlu unggah foto KTP.",
                      "Used for printing your donation certificate. No KTP photo upload required."
                    )}
                  </p>
                </div>
              </>
            )}


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

            {turnstileEnabled && (
              <div className="flex justify-center">
                <Turnstile onVerify={setTurnstileToken} />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (turnstileEnabled && !turnstileToken)}
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
          </>}
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
          <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
