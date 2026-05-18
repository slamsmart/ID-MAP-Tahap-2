"use client";

import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";

const transactions = [
  { id: "TXN-001", date: "10 Mei 2024", user: "PT. Hijau Lestari", type: "Pembelian Credit", amount: "10.000 tCO₂e", value: "Rp 650.000.000", status: "Berhasil" },
  { id: "TXN-002", date: "9 Mei 2024", user: "PT. Bumi Sejahtera", type: "Pembelian Credit", amount: "5.000 tCO₂e", value: "Rp 325.000.000", status: "Berhasil" },
  { id: "TXN-003", date: "8 Mei 2024", user: "Komunitas Hijau", type: "Donasi QRIS", amount: "0,50 tCO₂e", value: "Rp 25.000", status: "Berhasil" },
  { id: "TXN-004", date: "7 Mei 2024", user: "PT. Energi Bersih", type: "Pembelian Credit", amount: "8.000 tCO₂e", value: "Rp 520.000.000", status: "Berhasil" },
  { id: "TXN-005", date: "6 Mei 2024", user: "Ahmad Fauzi", type: "Donasi QRIS", amount: "0,25 tCO₂e", value: "Rp 15.000", status: "Berhasil" },
  { id: "TXN-006", date: "5 Mei 2024", user: "PT. Nusa Green", type: "Pembelian Credit", amount: "3.000 tCO₂e", value: "Rp 195.000.000", status: "Pending" },
];

export default function TransaksiPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Transaksi</h1>
        <p className="text-sm text-gray-500 mt-1">Riwayat semua transaksi carbon credit dan donasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Transaksi Bulan Ini</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 45,2 M</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +16,2% dari bulan lalu</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pembelian Credit</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 44,8 M</p>
          <p className="text-xs text-gray-400 mt-1">186 transaksi</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Donasi Komunitas</p>
          <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 385 Jt</p>
          <p className="text-xs text-gray-400 mt-1">12.450 transaksi</p>
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User/Perusahaan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-500">{t.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.date}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.user}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-sm">
                    {t.type === "Pembelian Credit" ? <ArrowDownLeft className="w-3 h-3 text-blue-500" /> : <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{t.amount}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{t.value}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === "Berhasil" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
