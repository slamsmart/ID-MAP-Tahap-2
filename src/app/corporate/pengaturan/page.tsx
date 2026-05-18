"use client";

import { Save, Building2, Bell, Users } from "lucide-react";

export default function PengaturanCorporatePage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola profil dan preferensi perusahaan</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-purple-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Profil Perusahaan</h3>
              <p className="text-xs text-gray-500">Informasi perusahaan</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="PT. Hijau Lestari" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPWP</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="01.234.567.8-901.000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industri</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="Energi & Pertambangan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email PIC</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="csr@hijaulestari.co.id" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="Jl. Sudirman No. 123, Jakarta Selatan 12190" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Tim & Akses</h3>
              <p className="text-xs text-gray-500">Kelola anggota tim perusahaan</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: "Budi Santoso", role: "Admin", email: "budi@hijaulestari.co.id" },
              { name: "Siti Rahayu", role: "Finance", email: "siti@hijaulestari.co.id" },
              { name: "Andi Wijaya", role: "CSR Manager", email: "andi@hijaulestari.co.id" },
            ].map((m) => (
              <div key={m.email} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">{m.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center"><Bell className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Notifikasi</h3>
              <p className="text-xs text-gray-500">Preferensi notifikasi perusahaan</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Konfirmasi Pembelian Credit", enabled: true },
              { label: "Sertifikat Diterbitkan", enabled: true },
              { label: "Update ESG Score", enabled: true },
              { label: "Laporan Bulanan", enabled: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2">
                <p className="text-sm text-gray-700">{n.label}</p>
                <div className={`w-11 h-6 rounded-full cursor-pointer ${n.enabled ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 ${n.enabled ? "ml-[22px]" : "ml-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800">
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
