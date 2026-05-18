"use client";

import { Leaf, Droplets, Wind, Trees } from "lucide-react";

export default function DampakPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Dampak Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat kontribusi nyata Anda terhadap lingkungan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Carbon Offset", value: "8,50 tCO₂e", desc: "Total serapan karbon", icon: Wind, color: "text-emerald-600 bg-emerald-50" },
          { label: "Bibit Ditanam", value: "85", desc: "Bibit mangrove", icon: Trees, color: "text-green-600 bg-green-50" },
          { label: "Luas Ekosistem", value: "0,42 Ha", desc: "Area terdampak", icon: Leaf, color: "text-teal-600 bg-teal-50" },
          { label: "Air Bersih", value: "12.750 L", desc: "Air tersaring", icon: Droplets, color: "text-blue-600 bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Dampak per Proyek</h3>
          <div className="space-y-4">
            {[
              { name: "Reboisasi Mangrove Banyuwangi", co2: "3,30 tCO₂e", pct: 39 },
              { name: "Konservasi Mangrove Kalimantan", co2: "2,00 tCO₂e", pct: 24 },
              { name: "Mangrove Pantai Utara", co2: "1,60 tCO₂e", pct: 19 },
              { name: "Blue Carbon Mangrove Sumba", co2: "1,60 tCO₂e", pct: 18 },
            ].map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{p.name}</span>
                  <span className="text-emerald-600 font-semibold">{p.co2}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Ekuivalensi Dampak Anda</h3>
          <div className="space-y-4">
            {[
              { icon: "🚗", desc: "Sama dengan mengurangi", value: "34.000 km perjalanan mobil" },
              { icon: "🌳", desc: "Setara dengan menanam", value: "425 pohon dewasa" },
              { icon: "💡", desc: "Setara dengan menghemat", value: "9.350 kWh listrik" },
              { icon: "🏠", desc: "Sama dengan emisi dari", value: "4,25 rumah tangga/tahun" },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <span className="text-2xl">{e.icon}</span>
                <div>
                  <p className="text-xs text-gray-500">{e.desc}</p>
                  <p className="text-sm font-semibold text-emerald-800">{e.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 rounded-xl p-6 text-white">
        <h3 className="font-display font-semibold text-lg mb-2">Tingkatkan Dampak Anda!</h3>
        <p className="text-emerald-200 text-sm mb-4">Setiap dukungan melalui QRIS langsung berkontribusi ke proyek mangrove yang terverifikasi. Semakin banyak Anda mendukung, semakin besar dampak positif Anda.</p>
        <a href="/daftar?peran=komunitas" className="inline-block px-6 py-2.5 bg-white text-emerald-900 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition">
          Dukung Sekarang
        </a>
      </div>
    </div>
  );
}
