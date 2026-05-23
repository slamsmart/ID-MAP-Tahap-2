"use client";

import { useEffect, useState } from "react";
import { FolderTree, CheckCircle, Wallet, BarChart3, Sprout, Globe } from "lucide-react";
import Link from "next/link";
import { getSession, User } from "@/lib/auth";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatNumber, formatRupiah } from "@/lib/utils";
import EkosistemPanel from "@/components/dashboard/EkosistemPanel";

export default function MitraDashboard() {
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const mitraId = session?._id as Id<"users"> | undefined;

  const projects = useQuery(api.projects.listByMitra, mitraId ? { mitraId } : "skip");
  const allTransactions = useQuery(api.transactions.list);
  const mrvReports = useQuery(api.mrvReports.listAll);

  const activeProjectsCount = projects?.filter(p => p.status !== "Draft").length || 0;
  const totalSeeds = projects?.reduce((sum, p) => sum + (p.seedsPlanted || 0), 0) || 0;

  // Calculate funds received by checking transactions for this mitra's projects
  const mitraProjectIds = projects?.map(p => p._id) || [];
  const fundsReceived = allTransactions?.filter(tx => 
    tx.status === "Selesai" && 
    tx.projectId && 
    mitraProjectIds.includes(tx.projectId)
  ).reduce((sum, tx) => sum + tx.totalAmount, 0) || 0;

  const stats = [
    { label: "Proyek Aktif", value: formatNumber(activeProjectsCount), icon: FolderTree, color: "bg-emerald-50 text-emerald-700" },
    { label: "Bibit Ditanam", value: formatNumber(totalSeeds), icon: Sprout, color: "bg-green-50 text-green-700" },
    { label: "Dana Diterima", value: formatRupiah(fundsReceived), icon: Wallet, color: "bg-amber-50 text-amber-700" },
  ];

  // Get recent funding
  const recentFunding = allTransactions?.filter(tx => 
    tx.status === "Selesai" && 
    tx.projectId && 
    mitraProjectIds.includes(tx.projectId)
  ).slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Mitra</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola proyek mangrove dan pantau perkembangan</p>
        </div>
        <Link
          href="/mitra/proyek-baru"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
        >
          <Sprout className="w-4 h-4" />
          Tambah Proyek Baru
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Proyek Saya</h3>
          <Link href="/mitra/proyek" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Proyek</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Luas</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">SRN</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects && projects.length > 0 ? (
                projects.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 sm:px-5 py-3 font-medium text-gray-900">{p.title}</td>
                    <td className="px-4 sm:px-5 py-3 text-gray-500 hidden sm:table-cell">{p.area ? `${p.area} Ha` : "-"}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === "Terverifikasi" ? "bg-emerald-50 text-emerald-700" :
                        p.status === "Dalam Proses" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Globe className="w-3 h-3" />
                        {p.srnStatus || "Belum"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{p.progress || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-5 py-8 text-center text-gray-500">
                    Belum ada proyek terdaftar. Silakan tambahkan proyek baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Status MRV Terakhir</h3>
          <div className="space-y-3">
            {mrvReports && mitraProjectIds.length > 0 ? (
              mrvReports
                .filter(mrv => mitraProjectIds.includes(mrv.projectId))
                .slice(0, 3)
                .map((mrv, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                    mrv.status === "Selesai" ? "bg-emerald-50" : 
                    mrv.status === "Dalam Proses" ? "bg-amber-50" : "bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-2">
                      {mrv.status === "Selesai" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : mrv.status === "Dalam Proses" ? (
                        <BarChart3 className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">{mrv.type} {mrv.period}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      mrv.status === "Selesai" ? "bg-emerald-100 text-emerald-700" :
                      mrv.status === "Dalam Proses" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{mrv.status}</span>
                  </div>
                ))
            ) : (
               <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">Belum ada laporan MRV</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pendanaan Terbaru</h3>
          <div className="space-y-3">
            {recentFunding.length > 0 ? (
              recentFunding.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.companyName || "Donatur"}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">{formatRupiah(tx.totalAmount)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">Belum ada pendanaan masuk</div>
            )}
          </div>
        </div>
      </div>

      <EkosistemPanel />
    </div>
  );
}
