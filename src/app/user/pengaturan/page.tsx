"use client";

import { Save, User, Bell, Shield } from "lucide-react";

export default function PengaturanUserPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola profil dan preferensi akun Anda</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><User className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Profil</h3>
              <p className="text-xs text-gray-500">Informasi akun Anda</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="Ahmad Fauzi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="ahmad.fauzi@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="+62 812-3456-7890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" defaultValue="Surabaya, Jawa Timur" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Bell className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Notifikasi</h3>
              <p className="text-xs text-gray-500">Kelola preferensi notifikasi</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Donasi Berhasil", desc: "Notifikasi saat donasi berhasil diproses", enabled: true },
              { label: "Update Proyek", desc: "Notifikasi progress proyek yang Anda dukung", enabled: true },
              { label: "Sertifikat Baru", desc: "Notifikasi saat sertifikat diterbitkan", enabled: true },
              { label: "Newsletter", desc: "Info terbaru tentang mangrove Indonesia", enabled: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">{n.label}</p>
                  <p className="text-xs text-gray-500">{n.desc}</p>
                </div>
                <div className={`w-11 h-6 rounded-full cursor-pointer ${n.enabled ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 ${n.enabled ? "ml-[22px]" : "ml-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-purple-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Keamanan</h3>
              <p className="text-xs text-gray-500">Password dan keamanan akun</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <input type="password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input type="password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-900 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800">
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
