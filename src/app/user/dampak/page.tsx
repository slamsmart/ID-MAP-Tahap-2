"use client";

import { Trees, Waves, ShieldCheck, Rabbit } from "lucide-react";

const statCards = [
  {
    label: "Bibit Didukung",
    value: "85",
    desc: "Bibit mangrove ditanam",
    icon: Trees,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Pantai Terlindungi",
    value: "0,42 km",
    desc: "Garis pantai terjaga",
    icon: Waves,
    color: "text-sky-600 bg-sky-50",
  },
  {
    label: "Abrasi Dicegah",
    value: "12,3 m/thn",
    desc: "Pengurangan laju abrasi",
    icon: ShieldCheck,
    color: "text-orange-600 bg-orange-50",
  },
  {
    label: "Spesies Terjaga",
    value: "8",
    desc: "Spesies biota pesisir",
    icon: Rabbit,
    color: "text-emerald-600 bg-emerald-50",
  },
];

const proyekDampak = [
  { name: "Reboisasi Mangrove Banyuwangi", bibit: "33 bibit", pct: 39 },
  { name: "Konservasi Mangrove Kalimantan", bibit: "20 bibit", pct: 24 },
  { name: "Mangrove Pantai Utara", bibit: "16 bibit", pct: 19 },
  { name: "Blue Carbon Mangrove Sumba", bibit: "16 bibit", pct: 18 },
];

const manfaatEkosistem = [
  { icon: "🦀", desc: "Habitat kepiting bakau terjaga", value: "12 famili" },
  { icon: "🐟", desc: "Habitat ikan dan udang pesisir", value: "±1.250 ekor" },
  { icon: "🏠", desc: "Rumah pesisir terlindungi dari abrasi", value: "5 rumah" },
  { icon: "🌊", desc: "Redaman energi gelombang", value: "±40% berkurang" },
];

export default function DampakPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Dampak Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Kontribusi nyata Anda terhadap pemulihan ekosistem pesisir</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-display font-bold text-gray-900 mt-1 leading-tight">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bibit per Proyek */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Bibit per Proyek</h3>
          <div className="space-y-4">
            {proyekDampak.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium truncate pr-2">{p.name}</span>
                  <span className="text-emerald-600 font-semibold whitespace-nowrap">{p.bibit}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manfaat Ekosistem */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Manfaat Ekosistem</h3>
          <div className="space-y-3">
            {manfaatEkosistem.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-lg">
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

      {/* CTA Banner */}
      <div className="bg-[#0c1a2e] rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-lg">Perluas Dampak Anda!</h3>
            <p className="text-white/60 text-sm mt-1">
              Setiap bibit yang Anda dukung membantu memulihkan garis pantai dan melindungi komunitas pesisir dari abrasi.
            </p>
          </div>
          <a
            href="/user/donasi"
            className="inline-block px-6 py-2.5 bg-white text-[#0c1a2e] rounded-lg text-sm font-semibold hover:bg-gray-100 transition whitespace-nowrap flex-shrink-0"
          >
            Dukung Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}
