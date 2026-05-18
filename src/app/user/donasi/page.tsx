"use client";

import { QrCode, Heart, Leaf, ArrowUpRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const donationHistory = [
  { date: "10 Mei 2024", project: "Reboisasi Mangrove Banyuwangi", amount: "Rp 25.000", trees: "5 bibit" },
  { date: "8 Mei 2024", project: "Mangrove Pantai Utara", amount: "Rp 15.000", trees: "3 bibit" },
  { date: "5 Mei 2024", project: "Konservasi Mangrove Kalimantan", amount: "Rp 50.000", trees: "10 bibit" },
  { date: "3 Mei 2024", project: "Blue Carbon Mangrove Sumba", amount: "Rp 35.000", trees: "7 bibit" },
  { date: "1 Mei 2024", project: "Reboisasi Mangrove Banyuwangi", amount: "Rp 40.000", trees: "8 bibit" },
];

export default function DonasiPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Donasi & Kontribusi</h1>
        <p className="text-sm text-gray-500 mt-1">Dukung proyek mangrove melalui donasi QRIS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total Donasi</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">Rp 425.000</p>
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3" />+Rp 65.000 bulan ini</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Bibit Ditanam</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">85</p>
              <p className="text-xs text-gray-400 mt-1">Dari donasi Anda</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Proyek Didukung</p>
              <p className="text-2xl font-display font-bold text-gray-900 mt-1">4</p>
              <p className="text-xs text-gray-400 mt-1">Proyek mangrove</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">Riwayat Donasi</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {donationHistory.map((d, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center"><Heart className="w-4 h-4 text-emerald-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.project}</p>
                      <p className="text-xs text-gray-500">{d.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{d.amount}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1"><Leaf className="w-3 h-3" />{d.trees}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-900 mb-3 flex items-center gap-2"><QrCode className="w-5 h-5 text-emerald-600" /> Donasi via QRIS</h3>
            <p className="text-sm text-gray-500 mb-4">Scan kode QR untuk berdonasi ke proyek mangrove</p>
            <div className="flex justify-center p-4 bg-white border border-gray-100 rounded-xl">
              <QRCodeSVG
                value="https://id-map.co.id/donate/mangrove?ref=qris&amount=open"
                size={180}
                level="M"
                fgColor="#064E3B"
                imageSettings={{
                  src: "/leaf-icon.png",
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">QRIS · Donasi Proyek Mangrove</p>
            <div className="mt-4 space-y-2">
              {["Rp 10.000", "Rp 25.000", "Rp 50.000", "Rp 100.000"].map((a) => (
                <button key={a} className="w-full px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium">{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
