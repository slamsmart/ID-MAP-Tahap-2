"use client";

import Link from "next/link";
import { Sprout, MapPin, Calendar } from "lucide-react";

const projects = [
  { name: "Reboisasi Mangrove Delta Mahakam", location: "Kutai Kartanegara, Kalimantan Timur", area: "150 Ha", status: "Aktif", planted: "85.200", co2: "32.100 tCO₂e", start: "Jan 2025", progress: 68 },
  { name: "Konservasi Mangrove Pantai Selatan", location: "Cilacap, Jawa Tengah", area: "85 Ha", status: "Verifikasi", planted: "28.600", co2: "10.750 tCO₂e", start: "Jun 2025", progress: 45 },
  { name: "Restorasi Mangrove Teluk Bintuni", location: "Teluk Bintuni, Papua Barat", area: "200 Ha", status: "Draft", planted: "11.600", co2: "5.400 tCO₂e", start: "Mar 2026", progress: 15 },
];

export default function MitraProyekPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Proyek Saya</h1>
        <Link href="/mitra/proyek-baru" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition">
          <Sprout className="w-4 h-4" /> Tambah Proyek
        </Link>
      </div>
      <div className="grid gap-4">
        {projects.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "Aktif" ? "bg-emerald-50 text-emerald-700" : p.status === "Verifikasi" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.start}</span>
                  <span>Luas: {p.area}</span>
                </div>
              </div>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">Lihat Detail</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div><p className="text-xs text-gray-500">Bibit Ditanam</p><p className="font-semibold text-gray-900">{p.planted}</p></div>
              <div><p className="text-xs text-gray-500">Serapan CO₂e</p><p className="font-semibold text-gray-900">{p.co2}</p></div>
              <div><p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${p.progress}%`}}/></div><span className="text-xs font-medium">{p.progress}%</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
