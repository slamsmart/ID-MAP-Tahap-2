"use client";

import { Search, Download } from "lucide-react";

const transactions = [
  { id: "CTX-001", date: "10 Mei 2024", project: "Reboisasi Mangrove Banyuwangi", credits: "5.000 tCO₂e", value: "Rp 325.000.000", method: "Transfer Bank", status: "Berhasil" },
  { id: "CTX-002", date: "22 Apr 2024", project: "Konservasi Mangrove Kalimantan", credits: "10.000 tCO₂e", value: "Rp 650.000.000", method: "QRIS", status: "Berhasil" },
  { id: "CTX-003", date: "15 Mar 2024", project: "Blue Carbon Mangrove Sumba", credits: "8.000 tCO₂e", value: "Rp 520.000.000", method: "Transfer Bank", status: "Berhasil" },
  { id: "CTX-004", date: "1 Feb 2024", project: "Mangrove Pantai Utara", credits: "5.000 tCO₂e", value: "Rp 325.000.000", method: "QRIS", status: "Berhasil" },
  { id: "CTX-005", date: "15 Jan 2024", project: "Reboisasi Mangrove Banyuwangi", credits: "10.000 tCO₂e", value: "Rp 650.000.000", method: "Transfer Bank", status: "Berhasil" },
];

export default function TransaksiCorporatePage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">Riwayat pembelian carbon credit perusahaan</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Pembelian</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 2,47 M</p>
          <p className="text-xs text-gray-400 mt-1">YTD 2024</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Credits Dibeli</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">38.000 tCO₂e</p>
          <p className="text-xs text-gray-400 mt-1">5 transaksi</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Rata-rata per Transaksi</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 494 Jt</p>
          <p className="text-xs text-gray-400 mt-1">7.600 tCO₂e</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Cari transaksi..." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Proyek</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credits</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Metode</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-500">{t.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.date}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.project}</td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-600">{t.credits}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{t.value}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.method}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
