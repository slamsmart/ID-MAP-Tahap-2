"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const projectStats = useQuery(api.projects.getStats);
  const txStats = useQuery(api.transactions.getTotalStats);
  const users = useQuery(api.users.list);
  const projects = useQuery(api.projects.list);
  const transactions = useQuery(api.transactions.list);
  const activities = useQuery(api.activities.listRecent, { limit: 5 });
  const kycStats = useQuery(api.kyc.getStats);

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
    </div>
  );
}
