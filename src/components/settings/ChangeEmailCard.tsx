"use client";

import { useState } from "react";
import { Mail, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getSession, setSession } from "@/lib/auth";

type Status = "idle" | "sending" | "verifying" | "success";

export default function ChangeEmailCard() {
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const current = getSession();
  const currentEmail = current?.email ?? "—";

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRetryAfter(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/change-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        const sec = Number(res.headers.get("Retry-After") ?? 0);
        setRetryAfter(sec);
        setError(data.error ?? "Terlalu banyak permintaan. Coba lagi nanti.");
        setStatus("idle");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim kode OTP.");
        setStatus("idle");
        return;
      }
      setStep("otp");
      setStatus("idle");
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setStatus("idle");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("verifying");
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim(), otpCode: otp.trim() }),
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        const sec = Number(res.headers.get("Retry-After") ?? 0);
        setRetryAfter(sec);
        setError(data.error ?? "Terlalu banyak percobaan. Coba lagi nanti.");
        setStatus("idle");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Gagal mengubah email.");
        setStatus("idle");
        return;
      }
      // Rotate session cache supaya UI & cookie (server) sinkron.
      const s = getSession();
      if (s) setSession({ ...s, email: data.email ?? newEmail.trim().toLowerCase() });
      setStatus("success");
      setStep("form");
      setOtp("");
      setNewEmail("");
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setStatus("idle");
    }
  }

  const sending = status === "sending";
  const verifying = status === "verifying";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Mail className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-gray-900">Ganti Email</h3>
          <p className="text-xs text-gray-500">Verifikasi lewat OTP ke email baru</p>
        </div>
      </div>

      {status === "success" && (
        <div className="flex items-center gap-2 mb-4 text-sm text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" /> Email berhasil diubah.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 mb-4 text-sm text-red-700 bg-red-50 px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {error}
            {retryAfter ? ` (${Math.ceil(retryAfter / 60)} menit)` : ""}
          </span>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Saat Ini</label>
        <input
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
          value={currentEmail}
          readOnly
        />
      </div>

      {step === "form" ? (
        <form onSubmit={handleSendOtp} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Baru</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email.baru@contoh.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={sending || !newEmail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim…</> : <>Kirim Kode OTP</>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="text-sm text-gray-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
            Kode OTP telah dikirim ke <strong>{newEmail.trim()}</strong>.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode OTP (6 digit)</label>
            <input
              inputMode="numeric"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi…</> : <><ShieldCheck className="w-4 h-4" /> Verifikasi &amp; Ganti</>}
            </button>
            <button
              type="button"
              onClick={() => { setStep("form"); setOtp(""); setError(null); }}
              disabled={verifying}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
