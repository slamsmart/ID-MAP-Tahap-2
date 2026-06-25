"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import {
  isWebAuthnAvailable,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  generateChallenge,
} from "@/lib/webauthn";
import { getSession } from "@/lib/auth";

interface EnrolledDevice {
  deviceName: string;
  createdAt: number;
}

interface BiometricStatus {
  enabled: boolean;
  count: number;
  credentials: EnrolledDevice[];
}

type EnrollPhase = "idle" | "scanning" | "saving" | "done" | "error";

export default function BiometricEnrollCard() {
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [phase, setPhase] = useState<EnrollPhase>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/webauthn");
      if (res.ok) setStatus(await res.json());
    } catch {
      // silent — show fallback UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    (async () => {
      if (!isWebAuthnAvailable()) return;
      const ok = await isPlatformAuthenticatorAvailable();
      setWebAuthnSupported(ok);
    })();
  }, [fetchStatus]);

  async function handleEnroll() {
    const session = getSession();
    if (!session) return;

    setPhase("scanning");
    setErrorMsg("");

    try {
      const challenge = generateChallenge();
      const result = await registerBiometric({
        userId: session.email,
        userName: session.email,
        displayName: session.name ?? session.email,
        challenge,
      });

      setPhase("saving");

      const res = await fetch("/api/auth/webauthn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId: result.credentialId,
          publicKey: result.publicKey,
          counter: result.counter,
          deviceName: result.deviceName,
          challenge,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menyimpan credential.");
      }

      setPhase("done");
      await fetchStatus();
      setTimeout(() => setPhase("idle"), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pendaftaran biometrik gagal.";
      if (msg.includes("cancelled") || msg.includes("NotAllowedError")) {
        setErrorMsg("Dibatalkan. Coba lagi.");
      } else {
        setErrorMsg(msg);
      }
      setPhase("error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat status biometrik…
      </div>
    );
  }

  const isEnrolling = phase === "scanning" || phase === "saving";

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status?.enabled ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Fingerprint className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {status?.enabled
              ? `Biometrik aktif (${status.count} perangkat)`
              : "Biometrik belum diaktifkan"}
          </span>
        </div>

        {webAuthnSupported && (
          <button
            onClick={handleEnroll}
            disabled={isEnrolling || phase === "done"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {phase === "done" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> Terdaftar!
              </>
            ) : isEnrolling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {phase === "scanning" ? "Scan biometrik…" : "Menyimpan…"}
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                {status?.enabled ? "Tambah Perangkat" : "Aktifkan Biometrik"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Not supported notice */}
      {!webAuthnSupported && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Perangkat atau browser ini tidak mendukung biometrik (sidik jari / Face ID).
        </p>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Enrolled devices list */}
      {status?.enabled && status.credentials.length > 0 && (
        <div className="space-y-1.5">
          {status.credentials.map((cred, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium">{cred.deviceName || "Perangkat"}</span>
              <span className="text-gray-400 ml-auto">
                {new Date(cred.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Security note */}
      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        Biometrik diproses di perangkatmu — tidak dikirim ke server
      </p>
    </div>
  );
}
