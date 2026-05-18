"use client";

import { QrCode, Clock, CheckCircle } from "lucide-react";

const scanHistory = [
  { id: "SCN-001", date: "10 Mei 2024, 14:32", merchant: "Kopi Nusantara Banyuwangi", amount: "Rp 25.000", carbonImpact: "0,50 tCO₂e", project: "Reboisasi Mangrove Banyuwangi", status: "Berhasil" },
  { id: "SCN-002", date: "8 Mei 2024, 10:15", merchant: "Warung Sego Pecel", amount: "Rp 15.000", carbonImpact: "0,25 tCO₂e", project: "Mangrove Pantai Utara", status: "Berhasil" },
  { id: "SCN-003", date: "5 Mei 2024, 19:45", merchant: "Toko Bumi Hijau", amount: "Rp 50.000", carbonImpact: "1,00 tCO₂e", project: "Konservasi Mangrove Kalimantan", status: "Berhasil" },
  { id: "SCN-004", date: "3 Mei 2024, 08:20", merchant: "Apotek Sehat Alami", amount: "Rp 35.000", carbonImpact: "0,75 tCO₂e", project: "Blue Carbon Mangrove Sumba", status: "Berhasil" },
  { id: "SCN-005", date: "1 Mei 2024, 13:10", merchant: "Restoran Bahari", amount: "Rp 40.000", carbonImpact: "0,80 tCO₂e", project: "Reboisasi Mangrove Banyuwangi", status: "Berhasil" },
];

export default function RiwayatScanPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Riwayat Scan</h1>
        <p className="text-sm text-gray-500 mt-1">Histori scan QRIS dan kontribusi karbon Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Scan</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">28</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><QrCode className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Donasi</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 425.000</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Carbon Offset</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">8,50 tCO₂e</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">Riwayat Scan QRIS</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {scanHistory.map((s) => (
            <div key={s.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.merchant}</p>
                  <p className="text-xs text-gray-500">{s.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{s.amount}</p>
                <p className="text-xs text-emerald-600">{s.carbonImpact} → {s.project}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
