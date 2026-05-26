"use client";

import { CheckCircle, Leaf, QrCode, Award, Settings } from "lucide-react";

const notifications = [
  { icon: CheckCircle, title: "Donasi Berhasil", desc: "Donasi Rp 25.000 ke Reboisasi Mangrove Banyuwangi telah berhasil diproses.", time: "2 jam lalu", read: false, color: "bg-emerald-50 text-emerald-600" },
  { icon: Leaf, title: "Bibit Mangrove Ditanam", desc: "5 bibit mangrove dari donasi Anda telah ditanam di lokasi Banyuwangi.", time: "1 hari lalu", read: false, color: "bg-green-50 text-green-600" },
  { icon: Award, title: "Sertifikat Baru", desc: "Sertifikat Kontributor Mangrove Anda telah diterbitkan. Unduh sekarang.", time: "3 hari lalu", read: true, color: "bg-yellow-50 text-yellow-600" },
  { icon: QrCode, title: "Scan QRIS Berhasil", desc: "Pembayaran Rp 15.000 di Warung Sego Pecel berhasil dengan 0,25 tCO₂e offset.", time: "5 hari lalu", read: true, color: "bg-blue-50 text-blue-600" },
  { icon: Leaf, title: "Update Proyek", desc: "Proyek Konservasi Mangrove Kalimantan telah mencapai progress 45%.", time: "1 minggu lalu", read: true, color: "bg-emerald-50 text-emerald-600" },
  { icon: Settings, title: "Update Sistem", desc: "Fitur baru: Lihat dampak ekuivalensi karbon Anda di halaman Dampak Saya.", time: "2 minggu lalu", read: true, color: "bg-gray-100 text-gray-500" },
];

export default function NotifikasiPage() {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Pemberitahuan</h1>
          <p className="text-sm text-gray-500 mt-1">Notifikasi dan pembaruan terbaru</p>
        </div>
        <button className="px-3 py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700">Tandai semua dibaca</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {notifications.map((n, i) => (
            <div key={i} className={`px-5 py-4 flex items-start gap-4 hover:bg-gray-50 cursor-pointer ${!n.read ? "bg-emerald-50/30" : ""}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-medium ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</h3>
                  {!n.read && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
