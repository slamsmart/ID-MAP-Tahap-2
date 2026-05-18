"use client";

import { Plus, Search, Filter, MapPin, Leaf } from "lucide-react";

const projects = [
  { id: "PRJ-001", name: "Reboisasi Mangrove Banyuwangi", location: "Banyuwangi, Jawa Timur", area: "450 Ha", co2: "100.000 tCO₂e", status: "Terverifikasi", progress: 78 },
  { id: "PRJ-002", name: "Konservasi Mangrove Kalimantan", location: "Kapuas Hulu, Kalimantan Barat", area: "1.200 Ha", co2: "350.000 tCO₂e", status: "Dalam Proses", progress: 45 },
  { id: "PRJ-003", name: "Mangrove Pantai Utara", location: "Demak, Jawa Tengah", area: "320 Ha", co2: "80.000 tCO₂e", status: "Terverifikasi", progress: 92 },
  { id: "PRJ-004", name: "Blue Carbon Mangrove Sumba", location: "Sumba, NTT", area: "560 Ha", co2: "120.000 tCO₂e", status: "Terverifikasi", progress: 65 },
  { id: "PRJ-005", name: "Mangrove Delta Mahakam", location: "Kutai Kartanegara, Kaltim", area: "800 Ha", co2: "210.000 tCO₂e", status: "Pendaftaran", progress: 15 },
  { id: "PRJ-006", name: "Restorasi Mangrove Cilacap", location: "Cilacap, Jawa Tengah", area: "275 Ha", co2: "68.000 tCO₂e", status: "Dalam Proses", progress: 55 },
];

export default function AdminProyekPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Manajemen Proyek</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua proyek karbon mangrove terdaftar</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800">
          <Plus className="w-4 h-4" /> Tambah Proyek
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Cari proyek..." />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Proyek</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lokasi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Luas</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Serapan CO₂</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{p.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.area}</td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-600">{p.co2}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.status === "Terverifikasi" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "Dalam Proses" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{p.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
