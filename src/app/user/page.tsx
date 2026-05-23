"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Leaf, MapPin, Camera, BookOpen } from "lucide-react";
import { getSession, User } from "@/lib/auth";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatNumber, formatRupiah } from "@/lib/utils";
import MangroveAIPanel from "@/components/dashboard/MangroveAIPanel";

const articles = [
  {
    title: "Apa itu Carbon Credit?",
    desc: "Pelajari dasar-dasar carbon credit dan manfaatnya.",
  },
  {
    title: "Mengapa Mangrove Penting?",
    desc: "Temukan peran penting mangrove untuk iklim.",
  },
  {
    title: "Bagaimana Proyek Diverifikasi?",
    desc: "Proses verifikasi proyek karbon di ID-MAP.",
  },
];

export default function UserDashboard() {
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const userId = session?._id as Id<"users"> | undefined;

  const impact = useQuery(api.contributions.getUserImpact, userId ? { userId } : "skip");
  const contributions = useQuery(api.contributions.listByUser, userId ? { userId } : "skip");
  
  // To get the name of the projects supported, we might just query all projects and map them
  const projects = useQuery(api.projects.list);

  const isLoading = impact === undefined || contributions === undefined || projects === undefined;

  // Get the most recent contribution
  const recentContribution = contributions?.[0];
  const recentProject = recentContribution 
    ? projects?.find(p => p._id === recentContribution.projectId) 
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Halo, {session?.name || "Komunitas Hijau"}{" "}
          <span role="img" aria-label="leaf">🌿</span>
        </h1>
        <p className="text-sm text-gray-500">
          Terima kasih telah berkontribusi untuk bumi yang lebih baik.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Impact Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-semibold text-gray-800 mb-4">
              Dampak Kontribusi Anda
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Kontribusi</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-2xl text-emerald-900">
                    {impact ? formatNumber(impact.totalAmount) : "—"}
                  </span>
                  <span className="text-xs text-gray-500">IDR</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total CO₂e Didukung</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-2xl text-emerald-900">
                    {impact ? impact.totalCo2.toFixed(2) : "—"}
                  </span>
                  <span className="text-xs text-gray-500">ton CO₂e</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Project */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-semibold text-gray-800 mb-3">
              Proyek yang Anda Dukung
            </h3>
            {recentContribution && recentProject ? (
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {recentProject.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {recentProject.location}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <div>
                      <span className="text-gray-400">Kontribusi Anda</span>
                      <p className="font-display font-semibold text-gray-800">
                        {formatRupiah(recentContribution.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">CO₂e Didukung</span>
                      <p className="font-display font-semibold text-gray-800">
                        {recentContribution.co2Equivalent.toFixed(2)} ton CO₂e
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Belum ada proyek yang didukung. Mulai berdonasi sekarang!
              </div>
            )}
            <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-3 hover:text-emerald-700">
              Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scan History (Mapped to Contributions for now) */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-semibold text-gray-800 mb-4">
              Riwayat Kontribusi Terakhir
            </h3>
            <div className="space-y-3">
              {contributions && contributions.length > 0 ? (
                contributions.slice(0, 3).map((item) => {
                  const proj = projects?.find(p => p._id === item.projectId);
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {proj ? proj.title : "Proyek Karbon"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {proj ? proj.location : "Indonesia"}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-xs font-medium text-emerald-600">
                          {item.co2Equivalent.toFixed(2)} ton CO₂e
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">Belum ada riwayat.</div>
              )}
            </div>
            <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
              Lihat Semua Riwayat <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* QR Scanner */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
            <h3 className="font-display font-semibold text-emerald-900 text-center mb-3">
              Scan Proyek Karbon
            </h3>
            <p className="text-xs text-center text-gray-500 mb-4">
              Dukung Proyek Terverifikasi
            </p>
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-xl p-4">
                <QRCodeSVG
                  value="https://id-map.co.id/scan"
                  size={180}
                  fgColor="#064E3B"
                  level="M"
                />
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 mb-3">
              Arahkan kamera ke kode QR pada lokasi proyek
            </p>
            <button onClick={() => alert("Kamera berhasil diakses. Silakan arahkan ke kode QR proyek.")} className="w-full py-2.5 bg-emerald-700 text-white font-display font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              Scan Sekarang
            </button>
          </div>

          {/* Impact Stats */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-semibold text-gray-800 mb-4">
              Dampak Keseluruhan Anda
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Transaksi</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-gray-900">
                    {impact ? impact.totalContributions : "—"}
                  </span>
                  <span className="text-xs text-gray-400">kali</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Total CO₂e Didukung
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-gray-900">
                    {impact ? impact.totalCo2.toFixed(2) : "—"}
                  </span>
                  <span className="text-xs text-gray-400">ton CO₂e</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Total Proyek Didukung
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-xl text-gray-900">
                    {impact ? impact.projectsSupported : "—"}
                  </span>
                  <span className="text-xs text-gray-400">proyek</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Bergabung Sejak</span>
                <span className="font-display font-semibold text-gray-900">
                  {/* Just showing a placeholder since we don't fetch the user creation date directly here, or we could fetch the user document */}
                  April 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div>
        <h3 className="font-display font-semibold text-gray-800 mb-4">
          Edukasi & Insight
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div
              key={article.title}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-display font-semibold text-sm text-gray-800 mb-1">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 mb-3">{article.desc}</p>
              <button className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:text-emerald-700">
                Baca Artikel <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white">
          <h3 className="font-display font-bold text-xl mb-1">
            Terus Dukung Proyek Karbon Indonesia
          </h3>
          <p className="text-sm text-emerald-200">
            Setiap aksi kecil Anda, berdampak besar untuk masa depan bumi.
          </p>
        </div>
        <button className="px-6 py-2.5 bg-white text-emerald-900 font-display font-bold rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap text-sm">
          Scan Proyek Sekarang
        </button>
      </div>

      <MangroveAIPanel role="komunitas" />
    </div>
  );
}
