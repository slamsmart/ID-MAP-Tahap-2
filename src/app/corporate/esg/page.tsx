"use client";

import { BarChart3, Leaf, Award, TrendingUp, Download } from "lucide-react";

export default function ESGReportPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Laporan ESG</h1>
          <p className="text-sm text-gray-500 mt-1">Environmental, Social, and Governance Report</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800">
          <Download className="w-4 h-4" /> Export Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "ESG Score", value: "A+", icon: Award, color: "text-yellow-600 bg-yellow-50" },
          { label: "Environment", value: "92/100", icon: Leaf, color: "text-emerald-600 bg-emerald-50" },
          { label: "Social", value: "85/100", icon: BarChart3, color: "text-blue-600 bg-blue-50" },
          { label: "Governance", value: "88/100", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Environmental Performance</h3>
          <div className="space-y-4">
            {[
              { label: "Carbon Offset via Mangrove", value: "55.000 tCO₂e", target: "60.000 tCO₂e", pct: 92 },
              { label: "Renewable Energy Usage", value: "45%", target: "50%", pct: 90 },
              { label: "Waste Reduction", value: "32%", target: "40%", pct: 80 },
              { label: "Water Conservation", value: "28%", target: "30%", pct: 93 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{m.label}</span>
                  <span className="text-gray-500 text-xs">{m.value} / {m.target}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className={`h-full rounded-full ${m.pct >= 90 ? "bg-emerald-500" : m.pct >= 80 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Social & Governance Impact</h3>
          <div className="space-y-4">
            {[
              { label: "Komunitas Terdampak Positif", value: "12 desa", desc: "Di sekitar lokasi proyek mangrove" },
              { label: "Lapangan Kerja Lokal", value: "356 orang", desc: "Pekerja dari komunitas pesisir" },
              { label: "Pelatihan Lingkungan", value: "24 sesi", desc: "Pelatihan konservasi mangrove" },
              { label: "Transparansi Laporan", value: "100%", desc: "Semua data MRV terpublikasi" },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                <span className="text-sm font-bold text-emerald-700">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">Rekomendasi untuk Meningkatkan ESG Score</h3>
            <ul className="mt-3 space-y-2 text-sm text-emerald-200">
              <li>• Tingkatkan offset karbon 5.000 tCO₂e untuk mencapai target tahunan</li>
              <li>• Implementasikan program CSR mangrove di 3 lokasi baru</li>
              <li>• Daftarkan proyek tambahan ke SRN KLHK untuk compliance</li>
            </ul>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-emerald-800 rounded-full flex items-center justify-center">
              <span className="text-3xl font-display font-bold">A+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
