"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Leaf, MapPin, BookOpen } from "lucide-react";
import { getSession, User } from "@/lib/auth";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatNumber, formatRupiah } from "@/lib/utils";
import EkosistemPanel from "@/components/dashboard/EkosistemPanel";
import OnboardingTour from "@/components/dashboard/OnboardingTour";

const articles = [
  {
    title: "Mengapa Mangrove Penting?",
    desc: "Temukan peran penting mangrove untuk iklim dan ekosistem pesisir.",
  },
  {
    title: "Program Restorasi Mangrove",
    desc: "Kenali program PMN dan BRGMN dalam pemulihan mangrove nasional.",
  },
  {
    title: "Cara Melaporkan Kerusakan",
    desc: "Panduan melaporkan abrasi dan kerusakan mangrove di wilayah Anda.",
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
      {/* First-time onboarding tour — auto-hide setelah dismiss */}
      <OnboardingTour name={session?.name} />

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
                          {proj ? proj.title : "Proyek Mangrove"}
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
          {/* Edukasi & Insight */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-display font-semibold text-gray-800 mb-4">
              Edukasi &amp; Insight
            </h3>
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.title}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500 mb-1.5">{article.desc}</p>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:text-emerald-700">
                      Baca Artikel <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EkosistemPanel />
    </div>
  );
}
