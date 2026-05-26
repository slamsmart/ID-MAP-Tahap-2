"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Download, Eye, X, Leaf, Heart, Share2, Check, MessageCircle, Link as LinkIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getSession, User } from "@/lib/auth";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEscapeKey } from "@/lib/useEscapeKey";

// Konversi co2Amount → estimasi bibit (1 tCO₂e ≈ 10 bibit)
const toBibit = (co2: number) => Math.round(co2 * 10);

interface CertDisplay {
  id: string;
  ownerName: string;
  title: string;
  project: string;
  bibit: number;
  issuedDate: string;
  type: "carbon_credit" | "contribution";
}

const typeLabel: Record<CertDisplay["type"], string> = {
  carbon_credit: "Pemulih Mangrove",
  contribution: "Pendukung Proyek",
};

const typeBadge: Record<CertDisplay["type"], string> = {
  carbon_credit: "bg-emerald-100 text-emerald-700",
  contribution: "bg-sky-100 text-sky-700",
};

export default function SertifikatPage() {
  const [session, setSession] = useState<User | null>(null);
  const [previewCert, setPreviewCert] = useState<CertDisplay | null>(null);

  // Esc closes the certificate preview overlay.
  useEscapeKey(!!previewCert, () => setPreviewCert(null));

  useEffect(() => {
    setSession(getSession());
  }, []);

  const ownerId = session?._id as Id<"users"> | undefined;
  const certificates = useQuery(api.certificates.listByOwner, ownerId ? { ownerId } : "skip");
  const projects = useQuery(api.projects.list);

  const certDisplayList: CertDisplay[] = (certificates ?? []).map((cert) => {
    const proj = projects?.find((p) => p._id === cert.projectId);
    return {
      id: cert.certificateNumber,
      ownerName: session?.name ?? "Sahabat Pesisir",
      title: cert.type === "carbon_credit" ? "Sertifikat Pemulih Mangrove" : "Sertifikat Pendukung Proyek",
      project: proj?.title ?? "Proyek Mangrove",
      bibit: toBibit(cert.co2Amount),
      issuedDate: new Date(cert.issuedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      type: cert.type,
    };
  });

  const totalBibit = certDisplayList.reduce((sum, c) => sum + c.bibit, 0);

  const downloadCertificate = (cert: CertDisplay) => {
    // Escape XML-unsafe characters from user-supplied strings before
    // injecting into the inline SVG. SVG is not HTML — `<script>` is
    // possible if you embed unescaped quotes/angle brackets.
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ECFDF5"/>
            <stop offset="1" stop-color="#D1FAE5"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="#ffffff"/>
        <rect x="30" y="30" width="1140" height="740" fill="none" stroke="#064E3B" stroke-width="14"/>
        <rect x="46" y="46" width="1108" height="708" fill="url(#bg)"/>
        <circle cx="600" cy="170" r="60" fill="#D1FAE5"/>
        <text x="600" y="186" font-family="sans-serif" font-size="46" text-anchor="middle">🌿</text>
        <text x="600" y="280" font-family="sans-serif" font-size="22" font-weight="bold" fill="#059669" text-anchor="middle" letter-spacing="6">SERTIFIKAT APRESIASI</text>
        <text x="600" y="334" font-family="sans-serif" font-size="32" font-weight="bold" fill="#111827" text-anchor="middle">${esc(cert.title)}</text>
        <text x="600" y="382" font-family="sans-serif" font-size="16" fill="#4B5563" text-anchor="middle">Diberikan dengan bangga kepada</text>
        <text x="600" y="436" font-family="serif" font-size="44" font-weight="bold" fill="#0f3d2e" text-anchor="middle">${esc(cert.ownerName)}</text>
        <line x1="350" y1="464" x2="850" y2="464" stroke="#A7F3D0" stroke-width="2"/>
        <text x="600" y="498" font-family="sans-serif" font-size="16" fill="#4B5563" text-anchor="middle">atas dukungan pada proyek</text>
        <text x="600" y="540" font-family="sans-serif" font-size="24" font-weight="bold" fill="#064E3B" text-anchor="middle">${esc(cert.project)}</text>
        <text x="600" y="592" font-family="sans-serif" font-size="20" font-weight="bold" fill="#059669" text-anchor="middle">🌱 ${cert.bibit} Bibit Mangrove Didukung</text>
        <text x="120" y="694" font-family="sans-serif" font-size="14" fill="#6B7280">Tanggal Terbit</text>
        <text x="120" y="718" font-family="sans-serif" font-size="17" font-weight="bold" fill="#111827">${esc(cert.issuedDate)}</text>
        <text x="1080" y="694" font-family="sans-serif" font-size="14" fill="#6B7280" text-anchor="end">ID Sertifikat</text>
        <text x="1080" y="718" font-family="sans-serif" font-size="17" font-weight="bold" fill="#111827" text-anchor="end">${esc(cert.id)}</text>
      </svg>
    `;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sertifikat_${cert.ownerName.replace(/\s+/g, "_")}_${cert.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Compose share copy + verifiable URL. Cert ID is a stable identifier so
  // a future /verifikasi-sertifikat/[id] page can serve as proof. For now
  // we link to the project page, which juri/teman bisa cek langsung.
  const shareText = (cert: CertDisplay) =>
    `Saya baru saja mendukung "${cert.project}" dan mendapatkan ${cert.bibit} bibit mangrove! 🌱 Yuk bareng pulihkan ekosistem pesisir Indonesia lewat ID-MAP.`;
  const shareUrl = (cert: CertDisplay) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/proyek?ref=${encodeURIComponent(cert.id)}`
      : "https://idmap-pesisir.vercel.app/proyek";

  const [copied, setCopied] = useState(false);
  function handleCopy(cert: CertDisplay) {
    const text = `${shareText(cert)}\n${shareUrl(cert)}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }
  function handleShareWA(cert: CertDisplay) {
    const text = encodeURIComponent(`${shareText(cert)}\n${shareUrl(cert)}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }
  function handleShareTwitter(cert: CertDisplay) {
    const text = encodeURIComponent(shareText(cert));
    const url = encodeURIComponent(shareUrl(cert));
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Sertifikat</h1>
        <p className="text-sm text-gray-500 mt-1">Sertifikat kontribusi pemulihan ekosistem pesisir Anda</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Sertifikat</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">{certDisplayList.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Bibit Didukung</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">
            {totalBibit}{" "}
            <span className="text-base font-normal text-emerald-600">bibit</span>
          </p>
        </div>
      </div>

      {/* Certificate list */}
      <div className="space-y-4">
        {certificates === undefined ? (
          [1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-200 rounded w-64" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))
        ) : certDisplayList.length === 0 ? (
          <div className="bg-white rounded-card border border-gray-100 p-8 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">Belum ada sertifikat</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Sertifikat digital terbit otomatis setelah donasi Anda berhasil. Mulai dukung proyek mangrove untuk klaim sertifikat pertama.
            </p>
            <Link
              href="/proyek"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-button transition-colors"
            >
              <Heart className="w-4 h-4" /> Dukung Proyek Sekarang
            </Link>
          </div>
        ) : (
          certDisplayList.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 text-sm sm:text-base">
                      {cert.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{cert.project}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        🌱 {cert.bibit} bibit
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge[cert.type]}`}>
                        {typeLabel[cert.type]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Diterbitkan: {cert.issuedDate} · {cert.id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    aria-label={`Lihat sertifikat ${cert.id}`}
                    className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Lihat</span>
                  </button>
                  <button
                    onClick={() => handleShareWA(cert)}
                    aria-label={`Bagikan sertifikat ${cert.id} ke WhatsApp`}
                    className="flex items-center gap-1 px-3 py-2 text-sm border border-emerald-200 bg-emerald-50 rounded-lg text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Bagikan</span>
                  </button>
                  <button
                    onClick={() => downloadCertificate(cert)}
                    aria-label={`Unduh sertifikat ${cert.id}`}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Unduh</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-12 text-center border-[12px] border-emerald-50">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-emerald-600" />
              </div>

              <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">
                Sertifikat Apresiasi
              </h2>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-4 leading-tight">
                {previewCert.title}
              </h3>

              <p className="text-gray-500 text-sm mb-2">
                Diberikan dengan bangga kepada
              </p>
              <p className="font-display font-bold text-2xl sm:text-3xl text-emerald-800 mb-1">
                {previewCert.ownerName}
              </p>
              <div className="w-32 h-px bg-emerald-200 mx-auto mb-4" />

              <p className="text-gray-500 text-sm mb-3">
                atas partisipasi dan dukungan dalam
              </p>

              <div className="inline-block px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-5">
                <p className="font-bold text-gray-900">{previewCert.project}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Kontribusi:{" "}
                  <span className="font-semibold text-emerald-600">
                    🌱 {previewCert.bibit} bibit mangrove
                  </span>
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${typeBadge[previewCert.type]}`}>
                  {typeLabel[previewCert.type]}
                </span>
              </div>

              <div className="flex justify-between items-end text-left border-t border-gray-100 pt-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tanggal Terbit</p>
                  <p className="font-semibold text-gray-900">{previewCert.issuedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">ID Sertifikat</p>
                  <p className="font-semibold text-gray-900 text-sm">{previewCert.id}</p>
                </div>
              </div>
            </div>

            {/* Share strip — separate from cert face so the SVG download
                stays clean while the modal still nudges social proof. */}
            <div className="px-6 pt-5 pb-2 border-t border-gray-100 bg-white">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Bagikan ke teman
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleShareWA(previewCert)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-button transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  onClick={() => handleShareTwitter(previewCert)}
                  aria-label="Bagikan ke X / Twitter"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold rounded-button transition-colors"
                >
                  <span className="font-bold">𝕏</span> X / Twitter
                </button>
                <button
                  onClick={() => handleCopy(previewCert)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-button transition-colors"
                  aria-live="polite"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin" : "Salin Link"}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Tutup
              </button>
              <button
                onClick={() => downloadCertificate(previewCert)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition"
              >
                <Download className="w-4 h-4" /> Unduh Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
