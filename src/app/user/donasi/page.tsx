"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  QrCode, Heart, Leaf, ArrowUpRight, CheckCircle,
  Loader2, RefreshCw, AlertCircle, ChevronDown, ShieldCheck, Clock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getSession, refreshSession, User } from "@/lib/auth";
import { Id } from "../../../../convex/_generated/dataModel";

const PRESET_AMOUNTS = [1000, 10000, 25000, 100000];

type PaymentState = "idle" | "generating" | "waiting" | "simulating" | "paid" | "error";

interface QrisData {
  contributionId: string;
  paymentId: string;
  qrImageUrl: string | null;
  amount: number;
  co2Equivalent: number;
  isDummy: boolean;
  isSandbox: boolean;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function KycGate({ status }: { status?: string }) {
  const config: Record<string, { icon: ReactNode; title: string; desc: string; color: string }> = {
    belum: {
      icon: <ShieldCheck className="w-8 h-8 text-gray-400" />,
      title: "Verifikasi Akun Diperlukan",
      desc: "Lengkapi KYC terlebih dahulu untuk dapat melakukan donasi QRIS.",
      color: "text-gray-500",
    },
    menunggu: {
      icon: <Clock className="w-8 h-8 text-amber-500" />,
      title: "Menunggu Verifikasi",
      desc: "Dokumen KYC Anda sedang ditinjau oleh tim verifikator. Donasi akan tersedia setelah disetujui.",
      color: "text-amber-600",
    },
    ditolak: {
      icon: <AlertCircle className="w-8 h-8 text-red-500" />,
      title: "Verifikasi Ditolak",
      desc: "Pengajuan KYC Anda ditolak. Silakan perbarui dokumen dan ajukan ulang.",
      color: "text-red-600",
    },
  };

  const c = config[status ?? "belum"] ?? config.belum;

  return (
    <div className="py-6 flex flex-col items-center gap-3 text-center">
      {c.icon}
      <div>
        <p className={`font-semibold ${c.color}`}>{c.title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
      </div>
      <a
        href="/user/kyc"
        className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        {status === "ditolak" ? "Ajukan Ulang KYC" : "Lengkapi KYC Sekarang"}
      </a>
    </div>
  );
}

export default function DonasiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [state, setState] = useState<PaymentState>("idle");
  const [qrisData, setQrisData] = useState<QrisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    const syncSession = () => {
      if (mounted) setUser(getSession());
    };

    syncSession();
    void refreshSession().then((nextUser) => {
      if (mounted) setUser(nextUser);
    });
    window.addEventListener("session:change", syncSession);

    return () => {
      mounted = false;
      window.removeEventListener("session:change", syncSession);
    };
  }, []);

  const projects = useQuery(api.projects.listVerified);
  const userData = useQuery(
    api.users.get,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );
  const userImpact = useQuery(
    api.contributions.getUserImpact,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );
  const contribs = useQuery(
    api.contributions.listByUser,
    user?._id ? { userId: user._id as Id<"users"> } : "skip"
  );

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  const finalAmount = customAmount ? parseInt(customAmount.replace(/\D/g, "")) || 0 : amount;
  const selectedProject = projects?.find((p) => p._id === selectedProjectId);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(n);

  async function handleCreateQris() {
    if (!finalAmount || finalAmount < 1000) {
      setErrorMsg("Minimal donasi Rp 1.000");
      return;
    }
    if (!selectedProjectId) {
      setErrorMsg("Pilih proyek terlebih dahulu");
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
          projectId: selectedProjectId,
          userId: user?._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat QRIS");
      setQrisData(data as QrisData);
      setState("waiting");
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Terjadi kesalahan"));
      setState("error");
    }
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Simulasi gagal");
      setState("paid");
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Simulasi gagal"));
      setState("error");
    }
  }

  function handleReset() {
    setQrisData(null);
    setState("idle");
    setErrorMsg("");
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Donasi & Kontribusi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dukung proyek mangrove melalui donasi QRIS · Powered by Mayar.id
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Stats + History ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total Donasi</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">
                {userImpact ? formatRp(userImpact.totalAmount) : "Rp 0"}
              </p>
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                {userImpact?.totalContributions ?? 0} transaksi
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">CO₂ Didukung</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">
                {userImpact ? userImpact.totalCo2.toFixed(2) : "0"} tCO₂e
              </p>
              <p className="text-xs text-gray-400 mt-1">Dari donasi Anda</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Proyek Didukung</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">
                {userImpact?.projectsSupported ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Proyek mangrove</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">Riwayat Donasi</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {contribs && contribs.length > 0 ? (
                contribs.map((c) => (
                  <div key={c._id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Heart className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Donasi Proyek Mangrove</p>
                        <p className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatRp(c.amount)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Leaf className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs text-emerald-600">{c.co2Equivalent.toFixed(4)} tCO₂e</span>
                        {c.paymentStatus && (
                          <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full font-medium ${
                            c.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : c.paymentStatus === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {c.paymentStatus === "paid" ? "Lunas" : c.paymentStatus === "pending" ? "Menunggu" : "Gagal"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada riwayat donasi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── QRIS Panel ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Donasi via QRIS
            </h3>
            <p className="text-xs text-gray-400 mb-4">Mayar.id · Semua bank & e-wallet</p>

            {/* ── KYC GATE ── */}
            {userData === undefined ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : userData && userData.kycStatus !== "terverifikasi" ? (
              <KycGate status={userData.kycStatus} />
            ) : (
              <>
            {/* IDLE / ERROR */}
            {(state === "idle" || state === "error") && (
              <div className="space-y-4">
                {/* Pilih Proyek */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Proyek Tujuan</p>
                  <div className="relative">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    >
                      {!projects && <option value="">Memuat proyek…</option>}
                      {projects?.map((p) => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                      {projects?.length === 0 && (
                        <option value="">Belum ada proyek terverifikasi</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedProject && (
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedProject.location}, {selectedProject.province}
                    </p>
                  )}
                </div>

                {/* Pilih Nominal */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Nominal Donasi</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setAmount(a); setCustomAmount(""); }}
                        className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
                          finalAmount === a && !customAmount
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {formatRp(a)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                    <input
                      type="text"
                      placeholder="Nominal lain…"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {finalAmount >= 1000 && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                    {formatRp(finalAmount)} ≈ <strong>{(finalAmount / 5000).toFixed(4)} tCO₂e</strong> diserap mangrove
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
                  disabled={!finalAmount || finalAmount < 1000 || !selectedProjectId}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Buat QRIS Pembayaran
                </button>
              </div>
            )}

            {/* GENERATING */}
            {state === "generating" && (
              <div className="py-10 flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-sm">Membuat QRIS via Mayar.id…</p>
              </div>
            )}

            {/* WAITING PAYMENT */}
            {state === "waiting" && qrisData && (
              <div className="space-y-4">
                {(qrisData.isSandbox || qrisData.isDummy) && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {qrisData.isDummy
                        ? "Mode Demo — tambahkan MAYAR_API_KEY di .env.local untuk QR sungguhan."
                        : "Sandbox Mayar.id aktif — gunakan tombol simulasi."}
                    </span>
                  </div>
                )}

                <div className="flex justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  {qrisData.qrImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrisData.qrImageUrl} alt="QRIS" className="w-44 h-44 object-contain" />
                  ) : (
                    <QRCodeSVG
                      value={`https://mayar.id/pay/demo?amount=${qrisData.amount}&ref=${qrisData.paymentId}`}
                      size={176}
                      level="M"
                      fgColor="#064E3B"
                    />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{formatRp(qrisData.amount)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Scan dengan bank / e-wallet manapun</p>
                </div>

                <div className="bg-emerald-50 rounded-lg px-3 py-2 space-y-1">
                  <p className="text-xs font-semibold text-emerald-800">Detail Transaksi</p>
                  <p className="text-xs text-emerald-700">
                    CO₂e: <strong>{qrisData.co2Equivalent.toFixed(4)} tCO₂e</strong>
                  </p>
                  <p className="text-xs text-gray-400 font-mono break-all">
                    ID: {qrisData.paymentId?.slice(0, 24)}…
                  </p>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simulasi Pembayaran Berhasil
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ganti nominal / proyek
                </button>
              </div>
            )}

            {/* SIMULATING */}
            {state === "simulating" && (
              <div className="py-10 flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm">Memproses pembayaran…</p>
              </div>
            )}

            {/* PAID */}
            {state === "paid" && qrisData && (
              <div className="space-y-4">
                <div className="py-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Pembayaran Berhasil!</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Terima kasih atas donasi {formatRp(qrisData.amount)}
                    </p>
                  </div>
                  <div className="w-full bg-emerald-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-emerald-700 font-semibold">Dampak Donasi Anda</p>
                    <p className="text-xl font-bold text-emerald-800 mt-0.5">
                      {qrisData.co2Equivalent.toFixed(4)} tCO₂e
                    </p>
                    <p className="text-xs text-emerald-600">karbon tersimpan di mangrove</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 border border-emerald-100 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold rounded-lg transition-colors"
                >
                  Donasi Lagi
                </button>
              </div>
            )}
            </>
            )}
          </div>

          {/* Panduan QRIS */}
          {(state === "idle" || state === "error") && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Cara Donasi QRIS</p>
              {[
                "Pilih proyek & masukkan nominal donasi",
                'Klik "Buat QRIS Pembayaran"',
                "Scan QR dengan bank/e-wallet manapun",
                "Konfirmasi pembayaran di aplikasi Anda",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-500">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
