"use client";

import { Save, Shield, Bell, Globe, Database, Key } from "lucide-react";

export default function PengaturanAdminPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi sistem platform ID-MAP</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><Globe className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Pengaturan Umum</h3>
              <p className="text-xs text-gray-500">Konfigurasi dasar platform</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Platform</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="ID-MAP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="admin@id-map.co.id" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Carbon Credit (per tCO₂e)</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="Rp 65.000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zona Waktu</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="Asia/Jakarta (WIB)" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Keamanan</h3>
              <p className="text-xs text-gray-500">Autentikasi dan akses kontrol</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Two-Factor Authentication (2FA)", desc: "Wajibkan 2FA untuk semua admin", enabled: true },
              { label: "Session Timeout", desc: "Auto logout setelah 30 menit idle", enabled: true },
              { label: "IP Whitelisting", desc: "Batasi akses admin berdasarkan IP", enabled: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${s.enabled ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${s.enabled ? "translate-x-5.5 ml-[22px]" : "ml-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center"><Bell className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Notifikasi</h3>
              <p className="text-xs text-gray-500">Kelola notifikasi email dan sistem</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Proyek Baru Didaftarkan", enabled: true },
              { label: "Transaksi Besar (> Rp 100 Jt)", enabled: true },
              { label: "Verifikasi MRV Selesai", enabled: true },
              { label: "Pengguna Corporate Baru", enabled: false },
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

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Database className="w-5 h-5 text-purple-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Integrasi API</h3>
              <p className="text-xs text-gray-500">Koneksi ke layanan eksternal</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "SRN KLHK API", status: "Terhubung", key: "srn_api_****" },
              { label: "QRIS Payment Gateway", status: "Terhubung", key: "qris_****" },
              { label: "Copernicus Satellite API", status: "Terhubung", key: "cop_****" },
              { label: "LAPAN Remote Sensing", status: "Konfigurasi", key: "—" },
            ].map((api) => (
              <div key={api.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{api.label}</p>
                    <p className="text-xs text-gray-400 font-mono">{api.key}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${api.status === "Terhubung" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{api.status}</span>
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
