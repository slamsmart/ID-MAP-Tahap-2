"use client";

import { Building2, TrendingUp, CreditCard, Search } from "lucide-react";

const companies = [
  { name: "PT. Hijau Lestari", industry: "Energi & Pertambangan", totalCredits: "55.000 tCO₂e", spent: "Rp 3,57 M", esgScore: "A+", status: "Premium" },
  { name: "PT. Bumi Sejahtera", industry: "Manufaktur", totalCredits: "32.000 tCO₂e", spent: "Rp 2,08 M", esgScore: "A", status: "Premium" },
  { name: "PT. Energi Bersih", industry: "Oil & Gas", totalCredits: "28.000 tCO₂e", spent: "Rp 1,82 M", esgScore: "B+", status: "Aktif" },
  { name: "PT. Nusa Green", industry: "Agrikultur", totalCredits: "12.000 tCO₂e", spent: "Rp 780 Jt", esgScore: "B", status: "Aktif" },
  { name: "PT. Laut Biru Indonesia", industry: "Maritim & Perikanan", totalCredits: "8.500 tCO₂e", spent: "Rp 552 Jt", esgScore: "A-", status: "Aktif" },
];

export default function CorporatePage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Corporate Management</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola klien perusahaan yang membeli carbon credit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Perusahaan</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">630</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue Bulan Ini</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 8,79 M</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Credits Terjual</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">135.500 tCO₂e</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Cari perusahaan..." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Perusahaan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Industri</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Credits</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ESG Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-purple-600" /></div>
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.industry}</td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-600">{c.totalCredits}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">{c.spent}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{c.esgScore}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "Premium" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
