"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { QRCodeSVG } from "qrcode.react";
import {
  Leaf,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getSession, type User } from "@/lib/auth";

const PRESETS = [1000, 10000, 25000, 100000];

type State =
  | "idle"
  | "generating"
  | "waiting"
  | "simulating"
  | "paid"
  | "error";

interface QrisData {
  contributionId: string;
  paymentId: string;
  qrImageUrl: string | null;
  amount: number;
  co2Equivalent: number;
  isDummy: boolean;
  isSandbox: boolean;
}

// Public donation page — accessible without login.
// Reachable from QR code printed on the field at each verified project.
export default function DonasiCepatPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  // Guard: scan QRIS wajib login dulu agar donasi tertaut ke akun.
  // Non-login → /daftar dgn ?next=/donasi-cepat/<id> sehingga setelah daftar
  // user balik ke halaman ini dan kontribusinya tercatat ke userId-nya.
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const s = getSession();
    if (!s) {
      const next = encodeURIComponent(`/donasi-cepat/${projectId ?? ""}`);
      router.replace(`/daftar?peran=sahabat&next=${next}`);
      return;
    }
    setUser(s);
    setAuthChecked(true);
  }, [projectId, router]);

  const project = useQuery(
    api.projects.get,
    projectId && authChecked ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [state, setState] = useState<State>("idle");
  const [qrisData, setQrisData] = useState<QrisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const finalAmount = customAmount
    ? parseInt(customAmount.replace(/\D/g, "")) || 0
    : amount;

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  // Auto-poll the contribution status while waiting for webhook.
  useEffect(() => {
    if (state !== "waiting" || !qrisData) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment/status?contributionId=${qrisData.contributionId}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const j = (await res.json()) as { paymentStatus?: string };
        if (j.paymentStatus === "paid") setState("paid");
      } catch {
        // ignore — keep polling
      }
    }, 3000);
    return () => clearInterval(t);
  }, [state, qrisData]);

  async function handleCreateQris() {
    if (!finalAmount || finalAmount < 1000) {
      setErrorMsg("Minimal donasi Rp 1.000");
      return;
    }
    setErrorMsg("");
    setState("generating");
    try {
      const res = await fetch("/api/payment/create-qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          projectId,
          userId: user?._id,
        }),
      });
      const data = (await res.json()) as QrisData & { error?: string };
      if (!res.ok)
        throw new Error(data.error ?? "Gagal membuat QRIS");
      setQrisData(data);
      setState("waiting");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMsg(msg);
      setState("error");
    }
  }

  function reset() {
    setQrisData(null);
    setState("idle");
    setErrorMsg("");
  }

  async function handleSimulatePayment() {
    if (!qrisData) return;
    setState("simulating");
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributionId: qrisData.contributionId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Simulasi gagal");
      setState("paid");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Simulasi gagal";
      setErrorMsg(msg);
      setState("error");
    }
  }

  if (!authChecked || project === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </main>
    );
  }
  if (project === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="font-display font-bold text-gray-900">
            Proyek tidak ditemukan
          </p>
          <p className="text-sm text-gray-500 mt-1">
            QR yang Anda scan mungkin sudah tidak aktif.
          </p>
          <Link
            href="/proyek"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" /> Lihat semua proyek
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-md mx-auto px-5 pt-6 pb-10">
        {/* Header */}
        <Link
          href="/proyek"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        {/* Project card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {project.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-5">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-medium">Proyek Terverifikasi</span>
            </div>
            <h1 className="text-lg font-display font-bold text-gray-900 leading-snug">
              {project.title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              {project.location}, {project.province}
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {project.description}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-emerald-50 rounded-lg py-2">
                <p className="text-[10px] text-emerald-700 uppercase tracking-wide">
                  CO₂e/thn
                </p>
                <p className="text-sm font-bold text-emerald-800 mt-0.5">
                  {project.co2Absorption}
                </p>
              </div>
              {typeof project.area === "number" && (
                <div className="bg-emerald-50 rounded-lg py-2">
                  <p className="text-[10px] text-emerald-700 uppercase tracking-wide">
                    Luas (ha)
                  </p>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    {project.area}
                  </p>
                </div>
              )}
              {typeof project.seedsPlanted === "number" && (
                <div className="bg-emerald-50 rounded-lg py-2">
                  <p className="text-[10px] text-emerald-700 uppercase tracking-wide">
                    Bibit
                  </p>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    {project.seedsPlanted}
                  </p>
                </div>
              )}
            </div>

            {/* Funding progress (Pokmaswas campaign) */}
            {typeof project.fundingTarget === "number" && project.fundingTarget > 0 && (() => {
              const raised = project.fundingRaised ?? 0;
              const target = project.fundingTarget;
              const pct = Math.min(100, Math.round((raised / target) * 100));
              const fmt = (n: number) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(n);
              return (
                <div className="mt-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-medium text-emerald-700">
                      Pendanaan terkumpul
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-sm font-bold text-emerald-800">
                      {fmt(raised)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      dari {fmt(target)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* QRIS panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4 shadow-sm">
          <h2 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600" />
            Dukung dengan QRIS
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">
            Mayar.id · Semua bank &amp; e-wallet
          </p>

          {(state === "idle" || state === "error") && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">
                  Nominal Donasi
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setAmount(a);
                        setCustomAmount("");
                      }}
                      className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                        finalAmount === a && !customAmount
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {formatRp(a)}
                    </button>
                  ))}
                </div>
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    placeholder="Nominal lain…"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(e) =>
                      setCustomAmount(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {finalAmount >= 1000 && (
                <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                  {formatRp(finalAmount)} ≈{" "}
                  <strong>
                    {(finalAmount / 5000).toFixed(4)} tCO₂e
                  </strong>{" "}
                  diserap mangrove
                </p>
              )}

              {errorMsg && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleCreateQris}
                disabled={!finalAmount || finalAmount < 1000}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-display font-semibold rounded-xl transition-colors"
              >
                Buat QR Pembayaran
              </button>
            </div>
          )}

          {state === "generating" && (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm">Membuat QRIS…</p>
            </div>
          )}

          {state === "waiting" && qrisData && (
            <div className="space-y-4">
              {qrisData.isDummy && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Mode Demo — server belum punya MAYAR_API_KEY.
                </div>
              )}
              <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-2xl">
                {qrisData.qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrisData.qrImageUrl}
                    alt="QRIS"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <QRCodeSVG
                    value={`https://mayar.id/pay/demo?amount=${qrisData.amount}&ref=${qrisData.paymentId}`}
                    size={224}
                    level="M"
                    fgColor="#064E3B"
                  />
                )}
              </div>

              <div className="text-center">
                <p className="text-2xl font-display font-bold text-gray-900">
                  {formatRp(qrisData.amount)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Buka aplikasi bank/e-wallet → Scan QR di atas
                </p>
              </div>

              <div className="bg-emerald-50 rounded-lg px-3 py-2 space-y-1">
                <p className="text-xs font-semibold text-emerald-800">
                  Detail
                </p>
                <p className="text-xs text-emerald-700 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />{" "}
                  {qrisData.co2Equivalent.toFixed(4)} tCO₂e
                </p>
                <p className="text-[10px] text-gray-400 font-mono break-all">
                  Ref: {qrisData.paymentId.slice(0, 24)}…
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                <Loader2 className="w-3 h-3 animate-spin" />
                Menunggu pembayaran… (otomatis terdeteksi)
              </div>

              <button
                onClick={handleSimulatePayment}
                className="w-full py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                Simulasi Bayar (Demo Juri)
              </button>

              <button
                onClick={reset}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Batal &amp; ganti nominal
              </button>
            </div>
          )}

          {state === "simulating" && (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm">Memproses simulasi pembayaran…</p>
            </div>
          )}

          {state === "paid" && qrisData && (
            <div className="py-6 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900 text-lg">
                  Terima kasih!
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Donasi {formatRp(qrisData.amount)} berhasil
                </p>
              </div>
              <div className="w-full bg-emerald-50 rounded-lg px-4 py-3">
                <p className="text-xs text-emerald-700 font-semibold">
                  Dampak Anda
                </p>
                <p className="text-2xl font-display font-bold text-emerald-800 mt-0.5">
                  {qrisData.co2Equivalent.toFixed(4)} tCO₂e
                </p>
                <p className="text-xs text-emerald-600">
                  karbon tersimpan di mangrove {project.title}
                </p>
              </div>
              <Link
                href="/user/sertifikat"
                className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-sm rounded-xl transition-colors text-center"
              >
                Lihat sertifikat saya
              </Link>
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Donasi lagi
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Powered by{" "}
          <span className="font-semibold text-gray-500">Mayar.id</span> · ID-MAP
          Pesisir
        </p>
      </div>
    </main>
  );
}
