"use client";

import { useState } from "react";
import Link from "next/link";

export default function TambahProyekPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">&#10003;</div>
        <h2 className="text-xl font-bold text-gray-900">Proyek Berhasil Ditambahkan!</h2>
        <p className="text-gray-500 mt-2">Proyek Anda akan ditinjau oleh tim ID-MAP sebelum dipublikasikan.</p>
        <Link href="/mitra/proyek" className="inline-block mt-6 px-6 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800">
          Lihat Proyek Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tambah Proyek Baru</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Proyek</label>
            <input type="text" placeholder="Nama proyek mangrove" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Lokasi</label>
              <input type="text" placeholder="Kabupaten, Provinsi" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Luas Area (Ha)</label>
              <input type="number" placeholder="100" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Jenis Mangrove</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Pilih jenis</option>
              <option>Rhizophora</option>
              <option>Avicennia</option>
              <option>Sonneratia</option>
              <option>Bruguiera</option>
              <option>Campuran</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Deskripsi Proyek</label>
            <textarea rows={4} placeholder="Jelaskan tujuan dan rencana proyek..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Estimasi Bibit</label>
            <input type="number" placeholder="50000" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Dokumen Pendukung</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-500">Upload proposal, izin lahan, atau dokumen pendukung lainnya</p>
              <button type="button" className="mt-2 text-sm text-emerald-600 font-medium">Pilih File</button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-6 py-2.5 bg-emerald-900 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition">
              Ajukan Proyek
            </button>
            <Link href="/mitra/proyek" className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
