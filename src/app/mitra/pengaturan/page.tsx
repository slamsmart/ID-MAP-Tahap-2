"use client";

import { useState } from "react";

export default function MitraPengaturanPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pengaturan</h1>
      {saved && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          Pengaturan berhasil disimpan!
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Profil Organisasi</h3>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Nama Organisasi</label>
          <input type="text" defaultValue="Yayasan Mangrove Hijau Indonesia" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
          <input type="email" defaultValue="info@mangrovehijau.org" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Telepon</label>
          <input type="tel" defaultValue="+62 812 3456 7890" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Alamat</label>
          <textarea rows={2} defaultValue="Jl. Pesisir Hijau No. 45, Samarinda, Kalimantan Timur" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="px-6 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
