"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Search,
  Users,
  Building2,
  UserCheck,
  ShieldCheck,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

type RoleFilter = "semua" | "sahabat" | "mitra" | "verifikator" | "admin";
type KycFilter = "semua" | "belum" | "menunggu" | "terverifikasi" | "ditolak";

const kycBadge = (status?: string) => {
  switch (status) {
    case "terverifikasi":
      return { label: "Terverifikasi", icon: ShieldCheck, className: "bg-emerald-100 text-emerald-700" };
    case "menunggu":
      return { label: "Menunggu", icon: Clock, className: "bg-yellow-100 text-yellow-700" };
    case "ditolak":
      return { label: "Ditolak", icon: XCircle, className: "bg-red-100 text-red-700" };
    case "belum":
      return { label: "Belum KYC", icon: AlertCircle, className: "bg-gray-100 text-gray-500" };
    default:
      return null;
  }
};

const roleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700";
    case "mitra":
      return "bg-blue-100 text-blue-700";
    case "verifikator":
      return "bg-teal-100 text-teal-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
};

export default function PenggunaPage() {
  const users = useQuery(api.users.list);
  const userStats = useQuery(api.users.getStats);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("semua");
  const [kycFilter, setKycFilter] = useState<KycFilter>("semua");

  const isLoading = users === undefined || userStats === undefined;

  const filteredUsers = (users ?? []).filter((u) => {
    const matchesSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organization ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "semua" || u.role === roleFilter;
    const matchesKyc =
      kycFilter === "semua" || (u.kycStatus ?? "belum") === kycFilter;
    return matchesSearch && matchesRole && matchesKyc;
  });

  const statsCards = [
    {
      label: "Total Pengguna",
      value: userStats ? new Intl.NumberFormat("id-ID").format(userStats.total) : "—",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Komunitas",
      value: userStats ? new Intl.NumberFormat("id-ID").format(userStats.sahabat) : "—",
      icon: UserCheck,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Mitra",
      value: userStats ? new Intl.NumberFormat("id-ID").format(userStats.mitra) : "—",
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Verifikator",
      value: userStats ? new Intl.NumberFormat("id-ID").format(userStats.verifikator) : "—",
      icon: Building2,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pengguna, status KYC, dan verifikasi akun
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">
                  {s.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KYC Summary Bar */}
      {userStats && (userStats.kycMenunggu > 0 || userStats.kycDitolak > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{userStats.kycMenunggu}</span> pengguna
            menunggu verifikasi KYC
            {userStats.kycDitolak > 0 && (
              <>
                {" "}• <span className="font-semibold">{userStats.kycDitolak}</span>{" "}
                ditolak
              </>
            )}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Cari nama, email, atau organisasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="semua">Semua Role</option>
          <option value="sahabat">Komunitas</option>
          <option value="mitra">Mitra</option>
          <option value="verifikator">Verifikator</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value as KycFilter)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="semua">Semua KYC</option>
          <option value="belum">Belum KYC</option>
          <option value="menunggu">Menunggu</option>
          <option value="terverifikasi">Terverifikasi</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data pengguna...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Organisasi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    KYC
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Bergabung
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      Tidak ada pengguna yang cocok
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const kyc = kycBadge(u.kycStatus);
                    return (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-semibold text-emerald-700">
                              {u.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.name}</p>
                              {u.phone && (
                                <p className="text-xs text-gray-400">{u.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {u.organization ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleBadge(u.role)}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {kyc ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${kyc.className}`}
                            >
                              <kyc.icon className="w-3 h-3" />
                              {kyc.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">
        Menampilkan {filteredUsers.length} dari {users?.length ?? 0} pengguna
      </p>
    </div>
  );
}
