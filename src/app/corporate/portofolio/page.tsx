"use client";

import { Leaf, TrendingUp, PieChart } from "lucide-react";

const portfolio = [
  { project: "Reboisasi Mangrove Banyuwangi", credits: "15.000 tCO₂e", value: "Rp 975 Jt", vintage: "2024", status: "Aktif", pct: 27 },
  { project: "Konservasi Mangrove Kalimantan", credits: "20.000 tCO₂e", value: "Rp 1,30 M", vintage: "2024", status: "Aktif", pct: 36 },
  { project: "Mangrove Pantai Utara", credits: "10.000 tCO₂e", value: "Rp 650 Jt", vintage: "2023", status: "Aktif", pct: 18 },
  { project: "Blue Carbon Mangrove Sumba", credits: "10.000 tCO₂e", value: "Rp 650 Jt", vintage: "2024", status: "Aktif", pct: 19 },
];

export default function PortofolioPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Portofolio Karbon</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan kepemilikan carbon credit perusahaan Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Carbon Credits</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">55.000 tCO₂e</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><Leaf className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Nilai Portofolio</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 3,57 M</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Proyek Aktif</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">4</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><PieChart className="w-5 h-5 text-purple-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Detail Portofolio</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Proyek</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credits</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vintage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {portfolio.map((p) => (
                <tr key={p.project} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.project}</td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-600">{p.credits}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.value}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.vintage}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Distribusi Portofolio</h3>
          <div className="space-y-3">
            {portfolio.map((p) => (
              <div key={p.project}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 truncate mr-2">{p.project.split(" ").slice(-1)[0]}</span>
                  <span className="text-gray-900 font-medium">{p.pct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
