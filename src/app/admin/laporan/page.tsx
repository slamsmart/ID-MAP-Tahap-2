"use client";

import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";

const monthlyData = [
  { month: "Jan", credits: 12500, revenue: 812 },
  { month: "Feb", credits: 15800, revenue: 1027 },
  { month: "Mar", credits: 18200, revenue: 1183 },
  { month: "Apr", credits: 22000, revenue: 1430 },
  { month: "Mei", credits: 26500, revenue: 1722 },
];

export default function LaporanPage() {
  const maxCredits = Math.max(...monthlyData.map(d => d.credits));

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">Analisis performa platform dan proyek karbon</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><Calendar className="w-4 h-4" /> Periode</button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Carbon Offset", value: "823.456 tCO₂e", change: "+12,5%", icon: BarChart3 },
          { label: "Revenue YTD", value: "Rp 98,65 M", change: "+18,2%", icon: TrendingUp },
          { label: "Proyek Aktif", value: "156", change: "+8", icon: BarChart3 },
          { label: "Rata-rata ESG", value: "B+", change: "Stabil", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-display font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-emerald-600 mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Carbon Credits Terjual per Bulan</h3>
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-emerald-500 rounded-t-lg" style={{ height: `${(d.credits / maxCredits) * 160}px` }} />
                <p className="text-xs text-gray-500 mt-2">{d.month}</p>
                <p className="text-xs font-medium text-gray-700">{(d.credits / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Revenue per Bulan (Juta Rp)</h3>
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-500 rounded-t-lg" style={{ height: `${(d.revenue / 1800) * 160}px` }} />
                <p className="text-xs text-gray-500 mt-2">{d.month}</p>
                <p className="text-xs font-medium text-gray-700">{d.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-display font-semibold text-gray-900 mb-4">Serapan Karbon Mangrove Indonesia (Estimasi AI/Satelit)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { region: "Kalimantan", area: "1,2 Jt Ha", co2: "312.000 tCO₂e/tahun", pct: 38 },
            { region: "Papua", area: "1,5 Jt Ha", co2: "286.000 tCO₂e/tahun", pct: 35 },
            { region: "Sumatera", area: "450 Rb Ha", co2: "128.000 tCO₂e/tahun", pct: 16 },
            { region: "Jawa & Lainnya", area: "350 Rb Ha", co2: "97.456 tCO₂e/tahun", pct: 11 },
          ].map((r) => (
            <div key={r.region} className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-emerald-100 flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-emerald-700">{r.pct}%</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{r.region}</p>
              <p className="text-xs text-gray-500">{r.area}</p>
              <p className="text-xs text-emerald-600 font-medium">{r.co2}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
