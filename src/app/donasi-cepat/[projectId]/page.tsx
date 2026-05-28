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
  Sparkles,
  Wallet,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getSession, type User } from "@/lib/auth";

const PRESETS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000];

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

// Public donation page — full-screen donor experience for /donasi-cepat/[id].
// Desktop: 2-column (project context | QRIS panel). Mobile: stacked.
export default function DonasiCepatPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  // Guard: scan QRIS wajib login dulu agar donasi tertaut ke akun.
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

  const [amount, setAmount] = useState(25_000);
  const [customAmount, setCustomAmount] = useState("");
  const [state, setState] = useState<State>("idle");
  const [qrisData, setQrisData] = useState<QrisData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSandbox, setIsSandbox] = useState(false);

  // Fetch sandbox flag once so banner persists sebelum user klik "Buat QR"
  // (qrisData.isSandbox baru tersedia setelah panggil /create-qris).
  useEffect(() => {
    fetch("/api/payment/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((c: { sandbox?: boolean }) => setIsSandbox(!!c.sandbox))
      .catch(() => {});
  }, []);

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
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat QRIS");
      setQrisData(data);
      setState("waiting");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
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

  const raised = project.fundingRaised ?? 0;
  const target = project.fundingTarget ?? 0;
  const pct =
    target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 lg:pt-8 lg:pb-16">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-5 lg:mb-8">
          <Link
            href="/proyek"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Pembayaran aman via Mayar.id
          </div>
        </div>

        {/* Mode Demo banner — persistent sepanjang halaman saat sandbox aktif.
            Memberi tahu juri/tester bahwa pembayaran tidak menggunakan uang
            sungguhan. Hilang otomatis di production (MAYAR_SANDBOX=false). */}
        {isSandbox && (
          <div className="mb-5 lg:mb-8 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Mode Demo / Sandbox aktif</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Halaman ini menggunakan Mayar.id sandbox. Tidak ada dana real yang ditransaksikan. Tombol &quot;Simulasi Bayar&quot; tersedia untuk testing alur tanpa scan QR.
              </p>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-start">
          {/* ─── LEFT: project context ─── */}
          <div className="space-y-5">
            {/* Project hero card */}
            <div className="bg-white rounded-3xl border border-emerald-100/60 overflow-hidden shadow-sm">
              {project.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-56 sm:h-64 lg:h-80 object-cover"
                />
              )}
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Proyek Terverifikasi
                  </span>
                  {project.serviceType && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {project.serviceType}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-gray-900 leading-tight">
                  {project.title}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {project.location}, {project.province}
                </div>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-emerald-50/70 rounded-xl py-3 px-2 text-center">
                    <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold">
                      CO₂e/thn
                    </p>
                    <p className="text-base sm:text-lg font-bold text-emerald-800 mt-1">
                      {project.co2Absorption}
                    </p>
                  </div>
                  {typeof project.area === "number" && (
                    <div className="bg-emerald-50/70 rounded-xl py-3 px-2 text-center">
                      <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold">
                        Luas (Ha)
                      </p>
                      <p className="text-base sm:text-lg font-bold text-emerald-800 mt-1">
                        {project.area}
                      </p>
                    </div>
                  )}
                  {typeof project.seedsPlanted === "number" && (
                    <div className="bg-emerald-50/70 rounded-xl py-3 px-2 text-center">
                      <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold">
                        Bibit
                      </p>
                      <p className="text-base sm:text-lg font-bold text-emerald-800 mt-1">
                        {project.seedsPlanted}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Funding progress */}
            {target > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 sm:p-6 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-emerald-800">
                    Pendanaan Pokmaswas
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-full">
                    {pct}%
                  </span>
                </div>
                <div className="h-3 bg-white/70 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <p className="text-lg sm:text-xl font-display font-bold text-emerald-900">
                    {formatRp(raised)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    dari {formatRp(target)}
                  </p>
                </div>
              </div>
            )}

            {/* Greeting & impact line — desktop only */}
            <div className="hidden lg:block bg-white rounded-3xl p-6 border border-emerald-100/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Halo{user?.name ? `, ${user.name}` : ""}!
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Setiap rupiah donasi Anda diserap mangrove dan
                    diteruskan langsung ke kelompok masyarakat pesisir
                    pelaksana. Sertifikat digital terbit otomatis setelah
                    pembayaran berhasil.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: QRIS panel ─── */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-lg shadow-emerald-900/5 overflow-hidden">
              {/* Panel header */}
              <div className="px-5 sm:px-7 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Heart className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-gray-900 text-base sm:text-lg">
                      Dukung dengan QRIS
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Mayar.id · Semua bank &amp; e-wallet
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel body */}
              <div className="p-5 sm:p-7">
                {(state === "idle" || state === "error") && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2.5">
                        Pilih Nominal Donasi
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map((a) => (
                          <button
                            key={a}
                            onClick={() => {
                              setAmount(a);
                              setCustomAmount("");
                            }}
                            className={`px-2 py-3 text-sm rounded-xl border-2 font-semibold transition-all ${
                              finalAmount === a && !customAmount
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                                : "border-emerald-100 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-100"
                            }`}
                          >
                            {a >= 1_000_000
                              ? `Rp${(a / 1_000_000).toFixed(0)}jt`
                              : `Rp${(a / 1000).toFixed(0)}rb`}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                          Rp
                        </span>
                        <input
                          type="text"
                          placeholder="Atau ketik nominal lain…"
                          inputMode="numeric"
                          value={customAmount}
                          onChange={(e) =>
                            setCustomAmount(e.target.value.replace(/\D/g, ""))
                          }
                          className="w-full pl-10 pr-3 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {finalAmount >= 1000 && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-start gap-3">
                        <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-emerald-900 font-semibold">
                            {formatRp(finalAmount)}
                          </p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            ≈{" "}
                            <strong>
                              {(finalAmount / 5000).toFixed(4)} tCO₂e
                            </strong>{" "}
                            diserap mangrove
                          </p>
                        </div>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {errorMsg}
                      </div>
                    )}

                    <button
                      onClick={handleCreateQris}
                      disabled={!finalAmount || finalAmount < 1000}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-display font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4.5 h-4.5" />
                      Buat QR Pembayaran
                    </button>

                    <p className="text-[11px] text-center text-gray-400">
                      Klik untuk membuat QR · 100% dana ke proyek
                    </p>
                  </div>
                )}

                {state === "generating" && (
                  <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium">Membuat QRIS…</p>
                  </div>
                )}

                {state === "waiting" && qrisData && (
                  <div className="space-y-4">
                    {qrisData.isDummy && (
                      <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Mode Demo — server belum punya MAYAR_API_KEY.
                      </div>
                    )}
                    <div className="flex justify-center p-5 bg-gradient-to-br from-emerald-50/50 to-white border-2 border-emerald-100 rounded-2xl">
                      {qrisData.qrImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrisData.qrImageUrl}
                          alt="QRIS"
                          className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                        />
                      ) : (
                        <QRCodeSVG
                          value={`https://mayar.id/pay/demo?amount=${qrisData.amount}&ref=${qrisData.paymentId}`}
                          size={272}
                          level="M"
                          fgColor="#064E3B"
                        />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-display font-bold text-gray-900">
                        {formatRp(qrisData.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Buka aplikasi bank/e-wallet → Scan QR di atas
                      </p>
                    </div>

                    <div className="bg-emerald-50 rounded-xl px-4 py-3 space-y-1.5">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        Detail
                      </p>
                      <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>
                          {qrisData.co2Equivalent.toFixed(4)} tCO₂e diserap
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono break-all">
                        Ref: {qrisData.paymentId.slice(0, 32)}…
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 justify-center bg-gray-50 rounded-lg py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      Menunggu pembayaran… (otomatis terdeteksi)
                    </div>

                    <button
                      onClick={handleSimulatePayment}
                      className="w-full py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-colors"
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
                  <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium">
                      Memproses simulasi pembayaran…
                    </p>
                  </div>
                )}

                {state === "paid" && qrisData && (
                  <div className="py-4 flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-gray-900 text-2xl">
                        Terima kasih!
                      </p>
                      <p className="text-sm text-gray-500 mt-1.5">
                        Donasi {formatRp(qrisData.amount)} berhasil
                      </p>
                    </div>
                    <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl px-4 py-4">
                      <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">
                        Dampak Anda
                      </p>
                      <p className="text-3xl font-display font-bold text-emerald-800 mt-1">
                        {qrisData.co2Equivalent.toFixed(4)} tCO₂e
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        karbon tersimpan di mangrove {project.title}
                      </p>
                    </div>
                    <Link
                      href="/user/sertifikat"
                      className="mt-1 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-display font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 text-center"
                    >
                      Lihat sertifikat saya
                    </Link>
                    <button
                      onClick={reset}
                      className="text-xs text-gray-500 hover:text-emerald-700 transition-colors"
                    >
                      Donasi lagi
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-5">
              Powered by{" "}
              <span className="font-semibold text-gray-500">Mayar.id</span> ·
              ID-MAP Pesisir
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
