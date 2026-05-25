"use client";

import { useState, useEffect } from "react";
import { Award, Download, Eye, X, Leaf } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getSession, User } from "@/lib/auth";
import { Id } from "../../../../convex/_generated/dataModel";

// Konversi co2Amount → estimasi bibit (1 tCO₂e ≈ 10 bibit)
const toBibit = (co2: number) => Math.round(co2 * 10);

interface CertDisplay {
  id: string;
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
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#ffffff"/>
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#064E3B" stroke-width="10"/>
        <rect x="30" y="30" width="740" height="540" fill="#ECFDF5"/>
        <circle cx="400" cy="150" r="50" fill="#D1FAE5"/>
        <text x="400" y="162" font-family="sans-serif" font-size="38" text-anchor="middle">🌿</text>
        <text x="400" y="248" font-family="sans-serif" font-size="18" font-weight="bold" fill="#059669" text-anchor="middle" letter-spacing="4">SERTIFIKAT APRESIASI</text>
        <text x="400" y="298" font-family="sans-serif" font-size="28" font-weight="bold" fill="#111827" text-anchor="middle">${cert.title}</text>
        <text x="400" y="348" font-family="sans-serif" font-size="15" fill="#4B5563" text-anchor="middle">Diberikan atas dukungan pada proyek:</text>
        <text x="400" y="388" font-family="sans-serif" font-size="22" font-weight="bold" fill="#064E3B" text-anchor="middle">${cert.project}</text>
        <text x="400" y="432" font-family="sans-serif" font-size="17" font-weight="bold" fill="#059669" text-anchor="middle">🌱 ${cert.bibit} Bibit Mangrove Didukung</text>
        <text x="100" y="515" font-family="sans-serif" font-size="13" fill="#6B7280">Tanggal Terbit:</text>
        <text x="100" y="535" font-family="sans-serif" font-size="15" font-weight="bold" fill="#111827">${cert.issuedDate}</text>
        <text x="700" y="515" font-family="sans-serif" font-size="13" fill="#6B7280" text-anchor="end">ID Sertifikat:</text>
        <text x="700" y="535" font-family="sans-serif" font-size="15" font-weight="bold" fill="#111827" text-anchor="end">${cert.id}</text>
      </svg>
    `;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sertifikat_${cert.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada sertifikat</p>
            <p className="text-sm text-gray-400 mt-1">
              Sertifikat akan terbit setelah Anda mendukung proyek pemulihan mangrove.
            </p>
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
                    className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Lihat</span>
                  </button>
                  <button
                    onClick={() => downloadCertificate(cert)}
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
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-5 leading-tight">
                {previewCert.title}
              </h3>

              <p className="text-gray-500 text-sm mb-4">
                Diberikan dengan bangga atas partisipasi dan dukungan dalam
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
                  <p className="font-semibold text-gray-900">{previewCert.id}</p>
                </div>
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
