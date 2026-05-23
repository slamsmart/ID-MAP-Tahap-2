"use client";

import { Save, Shield, Bell, Globe, Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export default function PengaturanAdminPage() {
  const seedMutation = useMutation(api.seed.seedAll);
  const resetSeedMutation = useMutation(api.seed.resetAndSeed);
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [seedMsg, setSeedMsg] = useState("");
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
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Database Demo</h3>
              <p className="text-xs text-gray-500">Inisialisasi atau reset data demo untuk semua role</p>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { role: "Komunitas", email: "user@idmap.id", pass: "user123", color: "emerald" },
              { role: "Mitra", email: "mitra@idmap.id", pass: "mitra123", color: "blue" },
              { role: "Verifikator", email: "verifikator@idmap.id", pass: "verif123", color: "purple" },
              { role: "Admin", email: "admin@idmap.id", pass: "admin123", color: "gray" },
            ].map((u) => (
              <div key={u.role} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{u.role}</p>
                <p className="text-xs font-mono text-gray-700">{u.email}</p>
                <p className="text-xs font-mono text-gray-400">{u.pass}</p>
              </div>
            ))}
          </div>

          {seedStatus !== "idle" && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm ${
              seedStatus === "loading" ? "bg-blue-50 text-blue-700 border border-blue-100" :
              seedStatus === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
              "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {seedStatus === "loading" && <RefreshCw className="w-4 h-4 animate-spin" />}
              {seedStatus === "success" && <CheckCircle className="w-4 h-4" />}
              {seedStatus === "error" && <AlertTriangle className="w-4 h-4" />}
              <span>{seedMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={seedStatus === "loading"}
              onClick={async () => {
                setSeedStatus("loading");
                setSeedMsg("Menjalankan seed...");
                try {
                  const msg = await seedMutation({});
                  setSeedStatus("success");
                  setSeedMsg(msg);
                } catch (e: any) {
                  setSeedStatus("error");
                  setSeedMsg(e.message ?? "Gagal menjalankan seed.");
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-colors"
            >
              <Database className="w-4 h-4" />
              Seed Database (jika kosong)
            </button>

            <button
              disabled={seedStatus === "loading"}
              onClick={async () => {
                if (!confirm("⚠️ Ini akan HAPUS semua data dan seed ulang. Lanjutkan?")) return;
                setSeedStatus("loading");
                setSeedMsg("Mereset dan menyeed ulang...");
                try {
                  const msg = await resetSeedMutation({});
                  setSeedStatus("success");
                  setSeedMsg(msg);
                } catch (e: any) {
                  setSeedStatus("error");
                  setSeedMsg(e.message ?? "Gagal reset & seed.");
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-500 disabled:opacity-60 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset &amp; Seed Ulang
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            <strong>Seed</strong> = hanya jalan jika DB kosong. <strong>Reset &amp; Seed Ulang</strong> = hapus semua data lalu isi ulang.
          </p>
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
