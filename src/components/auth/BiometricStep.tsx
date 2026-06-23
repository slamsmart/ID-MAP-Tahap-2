"use client";

import { useState, useEffect } from "react";
import { Fingerprint, ShieldCheck, AlertCircle, Loader2, ChevronRight, X } from "lucide-react";
import {
  isWebAuthnAvailable,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  generateChallenge,
  type RegisterResult,
} from "@/lib/webauthn";

interface BiometricStepProps {
  userId: string;       // email used as user handle
  userName: string;     // email
  displayName: string;  // full name
  onSuccess: (credential: RegisterResult, challenge: string) => void;
  onSkip: () => void;
}

type Phase = "checking" | "unavailable" | "ready" | "scanning" | "done" | "error";

export default function BiometricStep({
  userId,
  userName,
  displayName,
  onSuccess,
  onSkip,
}: BiometricStepProps) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!isWebAuthnAvailable()) { setPhase("unavailable"); return; }
      const available = await isPlatformAuthenticatorAvailable();
      setPhase(available ? "ready" : "unavailable");
    })();
  }, []);

  async function handleRegister() {
    setPhase("scanning");
    setErrorMsg("");
    try {
      const challenge = generateChallenge();
      const result = await registerBiometric({
        userId,
        userName,
        displayName,
        challenge,
      });
      setPhase("done");
      // short delay so checkmark is visible
      setTimeout(() => onSuccess(result, challenge), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Biometrik gagal.";
      if (msg.includes("cancelled") || msg.includes("NotAllowedError")) {
        setErrorMsg("Dibatalkan. Coba lagi atau lewati.");
      } else {
        setErrorMsg(msg);
      }
      setPhase("error");
    }
  }

  return (
    <div className="relative flex flex-col items-center gap-6 py-4 text-center">
      {/* Icon area */}
      <div className="relative">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500 ${
            phase === "done"
              ? "bg-emerald-100 ring-4 ring-emerald-400/30"
              : phase === "scanning"
              ? "bg-emerald-50 ring-4 ring-emerald-300/50 animate-pulse"
              : phase === "error"
              ? "bg-red-50 ring-4 ring-red-200"
              : "bg-[#0f3d2e]/8 ring-4 ring-[#0f3d2e]/10"
          }`}
        >
          {phase === "done" ? (
            <ShieldCheck className="h-12 w-12 text-emerald-600" />
          ) : phase === "scanning" ? (
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
          ) : phase === "error" ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Fingerprint className="h-12 w-12 text-[#0f3d2e]" />
          )}
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        {phase === "checking" && (
          <>
            <p className="text-base font-bold text-[#0f3d2e]">Memeriksa perangkat…</p>
            <p className="text-sm text-slate-500">Sebentar ya</p>
          </>
        )}
        {phase === "unavailable" && (
          <>
            <p className="text-base font-bold text-slate-700">Biometrik tidak tersedia</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Perangkat atau browser ini tidak mendukung sidik jari / face ID.
              Kamu tetap bisa daftar tanpa biometrik.
            </p>
          </>
        )}
        {phase === "ready" && (
          <>
            <p className="text-base font-bold text-[#0f3d2e]">Daftarkan Sidik Jari</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Gunakan sidik jari atau face ID untuk keamanan akun tambahan.
              Bisa dilewati dan diaktifkan nanti.
            </p>
          </>
        )}
        {phase === "scanning" && (
          <>
            <p className="text-base font-bold text-emerald-700">Tempelkan jari kamu…</p>
            <p className="text-sm text-slate-500">Ikuti instruksi di perangkat</p>
          </>
        )}
        {phase === "done" && (
          <>
            <p className="text-base font-bold text-emerald-700">Biometrik terdaftar!</p>
            <p className="text-sm text-slate-500">Melanjutkan pembuatan akun…</p>
          </>
        )}
        {phase === "error" && (
          <>
            <p className="text-base font-bold text-red-600">Gagal mendaftarkan biometrik</p>
            <p className="text-sm text-red-500 max-w-xs">{errorMsg}</p>
          </>
        )}
      </div>

      {/* Actions */}
      {phase === "ready" && (
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={handleRegister}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3d2e] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-900 transition"
          >
            <Fingerprint className="h-4 w-4" />
            Aktifkan Biometrik
          </button>
          <button
            onClick={onSkip}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
          >
            Lewati dulu <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {phase === "unavailable" && (
        <button
          onClick={onSkip}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <X className="h-3.5 w-3.5" /> Lanjut tanpa biometrik
        </button>
      )}

      {phase === "error" && (
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={handleRegister}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3d2e] py-3.5 text-sm font-bold text-white transition hover:bg-emerald-900"
          >
            Coba Lagi
          </button>
          <button
            onClick={onSkip}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
          >
            Lewati dulu <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Badge security note */}
      {(phase === "ready" || phase === "unavailable") && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Biometrik diproses di perangkatmu — tidak dikirim ke server
        </p>
      )}
    </div>
  );
}
