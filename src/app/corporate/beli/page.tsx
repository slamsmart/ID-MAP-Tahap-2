"use client";

import { ShoppingCart, Leaf, MapPin, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const availableCredits = [
  { project: "Reboisasi Mangrove Banyuwangi", location: "Banyuwangi, Jawa Timur", available: "85.000 tCO₂e", price: "Rp 65.000/tCO₂e", vintage: "2024", verified: true },
  { project: "Konservasi Mangrove Kalimantan", location: "Kapuas Hulu, Kalimantan Barat", available: "230.000 tCO₂e", price: "Rp 65.000/tCO₂e", vintage: "2024", verified: true },
  { project: "Mangrove Pantai Utara", location: "Demak, Jawa Tengah", available: "70.000 tCO₂e", price: "Rp 65.000/tCO₂e", vintage: "2023", verified: true },
  { project: "Blue Carbon Mangrove Sumba", location: "Sumba, NTT", available: "105.000 tCO₂e", price: "Rp 65.000/tCO₂e", vintage: "2024", verified: true },
];

export default function BeliCreditPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Beli Carbon Credit</h1>
        <p className="text-sm text-gray-500 mt-1">Beli carbon credit terverifikasi untuk offset emisi perusahaan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {availableCredits.map((c) => (
            <div key={c.project} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-gray-900">{c.project}</h3>
                    {c.verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{c.location}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="px-3 py-1 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-gray-500">Tersedia</p>
                      <p className="text-sm font-bold text-emerald-700">{c.available}</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500">Harga</p>
                      <p className="text-sm font-bold text-blue-700">{c.price}</p>
                    </div>
                    <div className="px-3 py-1 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Vintage</p>
                      <p className="text-sm font-bold text-gray-700">{c.vintage}</p>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800">
                  <ShoppingCart className="w-4 h-4" /> Beli
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-900 mb-3">Ringkasan Pembelian</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Credit (tCO₂e)</label>
                <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="1000" defaultValue="5000" />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Harga per tCO₂e</span>
                  <span className="text-gray-700">Rp 65.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jumlah Credit</span>
                  <span className="text-gray-700">5.000 tCO₂e</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-emerald-700">Rp 325.000.000</span>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4" /> Proses Pembelian
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-display font-semibold text-gray-900 mb-3">Bayar via QRIS</h3>
            <div className="flex justify-center p-4 bg-white border border-gray-100 rounded-xl">
              <QRCodeSVG
                value="https://id-map.co.id/corporate/payment?type=carbon-credit&amount=325000000"
                size={160}
                level="M"
                fgColor="#064E3B"
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">QRIS · Pembelian Carbon Credit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
