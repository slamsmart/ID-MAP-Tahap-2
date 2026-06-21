"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Inbox, ArrowLeft, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthBgImage } from "@/lib/heroImageStore";

type Step = "request" | "reset" | "success";

export default function LupaPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const DEFAULT_BG = "/images/hero-mangrove.webp";
  const [bgImage, setBgImage] = useState(DEFAULT_BG);

  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearResendTimer = () => {
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
  };

  const startResendCooldown = () => {
    clearResendTimer();
    setResendCooldown(60);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearResendTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    getAuthBgImage()
      .then((img) => { if (img) setBgImage(img); })
      .catch(() => {});
  }, []);

  useEffect(() => clearResendTimer, []);

  const sendResetOtp = async (normalizedEmail: string) => {
    const res = await fetch("/api/auth/send-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });
    return res;
  };

  // Step 1: minta OTP reset
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError(t("Email harus diisi.", "Email is required."));
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(t("Format email tidak valid.", "Invalid email format."));
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendResetOtp(normalizedEmail);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? t("Gagal mengirim kode reset.", "Failed to send reset code."));
        return;
      }
      // Selalu pindah ke step reset (server tidak expose existence email)
      setStep("reset");
      setOtpValue("");
      startResendCooldown();
    } catch {
      setError(t("Koneksi gagal. Pastikan internet Anda aktif.", "Connection failed."));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: submit OTP + password baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpValue.length < 6) {
      setError(t("Masukkan kode OTP 6 digit.", "Enter the 6-digit OTP code."));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("Password minimal 6 karakter.", "Password must be at least 6 characters."));
      return;
    }

    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          otpCode: otpValue.trim(),
          newPassword,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? t("Gagal reset password.", "Failed to reset password."));
        return;
      }
      setStep("success");
      setNewPassword("");
      setOtpValue("");
    } catch {
      setError(t("Koneksi gagal.", "Connection failed."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await sendResetOtp(normalizedEmail);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? t("Gagal mengirim ulang.", "Failed to resend."));
        return;
      }
      setOtpValue("");
      startResendCooldown();
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
      <div className="absolute inset-0 bg-[#0f3d2e]/50 backdrop-blur-[2px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <img
              src="/images/logo-white.png"
              alt="ID-MAP"
              className="h-20 w-auto object-contain"
            />
          </Link>
          <p className="text-sm font-medium text-emerald-50 mt-2 drop-shadow-sm">
            {t("Reset password akun", "Reset account password")}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8">
          {step === "request" && (
            <>
              <h1 className="font-display font-bold text-xl text-gray-900 mb-1">
                {t("Lupa Password", "Forgot Password")}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {t(
                  "Masukkan email akun Anda. Kami akan kirim kode OTP untuk reset password.",
                  "Enter your account email. We'll send an OTP code to reset your password."
                )}
              </p>

              {error && (
                <div role="alert" className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="block w-full py-2.5 bg-emerald-900 text-white font-display font-semibold rounded-lg hover:bg-emerald-800 transition-colors text-sm disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      {t("Mengirim…", "Sending…")}
                    </span>
                  ) : (
                    t("Kirim Kode Reset", "Send Reset Code")
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href="/masuk" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  {t("Kembali ke Masuk", "Back to Login")}
                </Link>
              </p>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7 text-emerald-700" aria-hidden="true" />
                </div>
                <h2 className="font-bold text-gray-900 text-lg">{t("Cek Email Anda", "Check Your Email")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("Kode OTP 6 digit dikirim ke", "6-digit OTP sent to")}{" "}
                  <span className="font-semibold text-emerald-700">{email}</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2">
                <Inbox className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {t(
                    "Email tidak masuk? Mohon cek folder Spam / Promosi.",
                    "Didn't receive it? Check your Spam / Promotions folder."
                  )}
                </span>
              </div>

              {error && (
                <div role="alert" className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-otp" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("Kode OTP", "OTP Code")}
                  </label>
                  <input
                    id="reset-otp"
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

                <div>
                  <label htmlFor="reset-new-password" className="text-sm font-medium text-gray-700 block mb-1">
                    {t("Password Baru", "New Password")}
                  </label>
                  <div className="relative">
                    <input
                      id="reset-new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("Min. 6 karakter", "Min. 6 characters")}
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

                <button
                  type="submit"
                  disabled={isLoading || otpValue.length < 6 || newPassword.length < 6}
                  className="block w-full py-2.5 bg-emerald-900 text-white font-display font-semibold rounded-lg hover:bg-emerald-800 transition-colors text-sm disabled:opacity-70"
                >
                  {isLoading ? t("Memproses…", "Processing…") : t("Reset Password", "Reset Password")}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading || resendCooldown > 0}
                  className="block w-full text-sm text-emerald-600 hover:text-emerald-700 text-center disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? t(`Kirim ulang dalam ${resendCooldown}s`, `Resend in ${resendCooldown}s`)
                    : t("Kirim ulang kode OTP", "Resend OTP code")}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("request"); setError(""); setOtpValue(""); setNewPassword(""); }}
                  className="block w-full text-sm text-gray-500 hover:text-gray-700 text-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline" aria-hidden="true" /> {t("Ganti email", "Change email")}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" aria-hidden="true" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">
                {t("Password Berhasil Direset", "Password Reset Successful")}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t(
                  "Silakan masuk dengan password baru Anda.",
                  "Please log in with your new password."
                )}
              </p>
              <button
                onClick={() => router.push("/masuk")}
                className="block w-full py-2.5 bg-emerald-900 text-white font-display font-semibold rounded-lg hover:bg-emerald-800 transition-colors text-sm"
              >
                {t("Ke Halaman Masuk", "Go to Login")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
