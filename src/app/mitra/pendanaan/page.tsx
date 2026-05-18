"use client";

import { Wallet, TrendingUp, ArrowDownLeft } from "lucide-react";

const transactions = [
  { source: "Corporate A - PT Hijau Lestari", amount: "Rp 450.000.000", date: "15 Apr 2026", type: "Carbon Credit" },
  { source: "QRIS Komunitas", amount: "Rp 12.500.000", date: "10 Apr 2026", type: "Donasi" },
  { source: "CSR PT. Bumi Sejahtera", amount: "Rp 750.000.000", date: "02 Apr 2026", type: "Sponsorship" },
  { source: "QRIS Komunitas", amount: "Rp 8.750.000", date: "28 Mar 2026", type: "Donasi" },
  { source: "Corporate B - Bank Hijau", amount: "Rp 300.000.000", date: "15 Mar 2026", type: "Carbon Credit" },
];

export default function MitraPendanaanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pendanaan</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3"><Wallet className="w-5 h-5 text-emerald-700" /></div>
          <p className="text-xs text-gray-500">Total Dana Diterima</p>
          <p className="text-xl font-bold text-gray-900 mt-1">Rp 1.521.250.000</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-blue-700" /></div>
          <p className="text-xs text-gray-500">Bulan Ini</p>
          <p className="text-xl font-bold text-gray-900 mt-1">Rp 462.500.000</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3"><ArrowDownLeft className="w-5 h-5 text-amber-700" /></div>
          <p className="text-xs text-gray-500">Pending Pencairan</p>
          <p className="text-xl font-bold text-gray-900 mt-1">Rp 300.000.000</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Riwayat Pendanaan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Sumber</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Jenis</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="text-left px-4 sm:px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 sm:px-5 py-3 font-medium text-gray-900">{tx.source}</td>
                  <td className="px-4 sm:px-5 py-3 text-gray-500 hidden sm:table-cell">{tx.type}</td>
                  <td className="px-4 sm:px-5 py-3 font-semibold text-emerald-700">{tx.amount}</td>
                  <td className="px-4 sm:px-5 py-3 text-gray-500 hidden sm:table-cell">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
