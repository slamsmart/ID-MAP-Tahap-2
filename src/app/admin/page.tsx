"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MangroveAIPanel from "@/components/dashboard/MangroveAIPanel";
import {
  FolderTree,
  Leaf,
  ArrowRightLeft,
  Users,
  TrendingUp,
  ArrowRight,
  MapPin,
  Building2,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Waves,
  TreePine,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ABRASION_SITES, PRIORITAS_CONFIG, type PrioritasType } from "@/lib/abrasionData";

export default function AdminDashboard() {
  const projectStats = useQuery(api.projects.getStats);
  const txStats = useQuery(api.transactions.getTotalStats);
  const users = useQuery(api.users.list);
  const projects = useQuery(api.projects.list);
  const transactions = useQuery(api.transactions.list);
  const activities = useQuery(api.activities.listRecent, { limit: 5 });
  const kycStats = useQuery(api.kyc.getStats);

  const [abrasionFilter, setAbrasionFilter] = useState<PrioritasType | "Semua">("Semua");
  const [expandedSite, setExpandedSite] = useState<number | null>(null);

  const isLoading = projectStats === undefined || txStats === undefined;

  const statsCards = [
    {
      label: "Total Proyek",
      value: projectStats ? String(projectStats.totalProjects) : "—",
      change: projectStats ? `${projectStats.verifiedProjects} Terverifikasi` : "",
      icon: FolderTree,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Serapan",
      value: projectStats
        ? `${(projectStats.totalCo2 / 1000000).toFixed(1)} jt ton CO₂e`
        : "—",
      change: `${projectStats?.inProgressProjects ?? 0} dalam proses`,
      icon: Leaf,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total Transaksi",
      value: txStats
        ? `Rp ${(txStats.totalAmount / 1000000000).toFixed(1)} M`
        : "—",
      change: `${txStats?.totalTransactions ?? 0} transaksi selesai`,
      icon: ArrowRightLeft,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Total Pengguna",
      value: users ? new Intl.NumberFormat("id-ID").format(users.length) : "—",
      change: "Semua role",
      icon: Users,
      color: "bg-orange-50 text-orange-700",
    },
  ];

  const recentProjects = (projects ?? []).slice(0, 3);
  const recentTx = (transactions ?? []).slice(0, 3);
  const recentActivities = activities ?? [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="font-display font-bold text-xl text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* Projects & Transactions Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Proyek Terbaru</h3>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{project.title}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Intl.NumberFormat("id-ID").format(project.co2Absorption)} tCO₂e
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    project.status === "Terverifikasi"
                      ? "bg-emerald-100 text-emerald-700"
                      : project.status === "Dalam Proses"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
            Lihat Semua Proyek <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Transaksi Terbaru</h3>
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div key={tx._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{tx.companyName}</p>
                  <p className="text-xs text-gray-500">
                    Beli {new Intl.NumberFormat("id-ID").format(tx.co2Amount)} tCO₂e
                  </p>
                </div>
                <p className="text-sm font-display font-semibold text-gray-800">
                  Rp {new Intl.NumberFormat("id-ID").format(tx.totalAmount)}
                </p>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
            Lihat Semua Transaksi <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Activities */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Aktivitas Sistem Terbaru</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity._id} className="flex gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-700">{activity.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(activity.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
            Lihat Semua Aktivitas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KYC Overview */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-800">Verifikasi KYC</h3>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-sm text-gray-500">Menunggu Review</span>
              </div>
              <span className="font-display font-bold text-yellow-600">
                {kycStats?.pending ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm text-gray-500">Disetujui</span>
              </div>
              <span className="font-display font-bold text-emerald-600">
                {kycStats?.approved ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-sm text-gray-500">Ditolak</span>
              </div>
              <span className="font-display font-bold text-red-600">
                {kycStats?.rejected ?? 0}
              </span>
            </div>
          </div>
          <Link href="/admin/verifikasi" className="flex items-center gap-1 text-sm text-emerald-600 font-medium mt-4 hover:text-emerald-700">
            Review Dokumen <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      {/* Coastal Abrasion Rehabilitation Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <Waves className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-gray-800">Prioritas Rehabilitasi Abrasi Pantai</h3>
              <p className="text-xs text-gray-400">15 lokasi pantai di Jawa Timur</p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-red-700">Tinggi: {ABRASION_SITES.filter(s => s.prioritas === "Tinggi").length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-700">Sedang: {ABRASION_SITES.filter(s => s.prioritas === "Sedang").length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold text-blue-700">Rendah–Sedang: {ABRASION_SITES.filter(s => s.prioritas === "Rendah–Sedang").length}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          {(["Semua", "Tinggi", "Sedang", "Rendah–Sedang"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAbrasionFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                abrasionFilter === f
                  ? f === "Tinggi"         ? "bg-red-100 text-red-700 border-red-200"
                  : f === "Sedang"         ? "bg-amber-100 text-amber-700 border-amber-200"
                  : f === "Rendah–Sedang"  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs text-gray-400 font-semibold px-5 py-3 w-8">#</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3">Nama Pantai</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden md:table-cell">Kecamatan / Kab</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden lg:table-cell">Indikasi Abrasi</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden sm:table-cell">Substrat</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 hidden sm:table-cell">Luasan</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3">Prioritas</th>
                <th className="text-left text-xs text-gray-400 font-semibold px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {ABRASION_SITES
                .filter(s => abrasionFilter === "Semua" || s.prioritas === abrasionFilter)
                .map((site) => {
                  const cfg = PRIORITAS_CONFIG[site.prioritas];
                  const isExpanded = expandedSite === site.no;
                  return (
                    <>
                      <tr
                        key={site.no}
                        onClick={() => setExpandedSite(isExpanded ? null : site.no)}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono">{site.no}</td>
                        <td className="px-3 py-3">
                          <span className="font-medium text-gray-800 text-sm">{site.namaPantai}</span>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell text-xs text-gray-500">{site.kecamatanKab}</td>
                        <td className="px-3 py-3 hidden lg:table-cell text-xs text-gray-500 max-w-[200px]">
                          <span className="line-clamp-1">{site.indikasiAbrasi}</span>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{site.substrat}</span>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell text-xs text-gray-600">{site.luasan}</td>
                        <td className="px-3 py-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            {site.prioritas}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-400">
                          {isExpanded ? <span className="text-xs">▲</span> : <span className="text-xs">▼</span>}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${site.no}-detail`} className="border-b border-gray-100 bg-emerald-50/30">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {site.kondisiSesudah !== "-" && (
                                <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Kondisi Sesudah</p>
                                  <p className="text-xs text-gray-600">{site.kondisiSesudah}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Indikasi Abrasi</p>
                                <p className="text-xs text-gray-600">{site.indikasiAbrasi}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <TreePine className="w-3 h-3" /> Tanaman Rekomendasi
                                </p>
                                <ul className="space-y-1">
                                  {site.tanamanRekomendasi.map((t, i) => (
                                    <li key={i} className="text-xs text-emerald-700 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <MangroveAIPanel role="admin" defaultExpanded />
    </div>
  );
}
