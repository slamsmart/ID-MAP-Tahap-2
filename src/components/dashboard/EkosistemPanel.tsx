"use client";

import {
  DATA_PROVINSI,
  ANCAMAN_MANGROVE,
  RINGKASAN_NASIONAL,
  DATA_BLUE_CARBON,
} from "@/lib/mangroveNasionalData";
import { AlertTriangle, Leaf, TrendingUp, Globe, Zap, ShieldAlert } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("id-ID");

const KONDISI_CFG = {
  baik:    { label: "Baik",    bg: "bg-emerald-600", light: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-100" },
  sedang:  { label: "Sedang",  bg: "bg-amber-500",   light: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-100" },
  kritis:  { label: "Kritis",  bg: "bg-red-600",     light: "bg-red-50",      text: "text-red-700",      border: "border-red-100" },
};

const ANCAMAN_CFG = {
  tinggi: { bg: "bg-red-600",    label: "Tinggi" },
  sedang: { bg: "bg-amber-500",  label: "Sedang" },
  rendah: { bg: "bg-blue-500",   label: "Rendah" },
};

export default function EkosistemPanel() {
  const total = DATA_PROVINSI.length;
  const baik   = DATA_PROVINSI.filter((p) => p.kondisi === "baik").length;
  const sedang = DATA_PROVINSI.filter((p) => p.kondisi === "sedang").length;
  const kritis = DATA_PROVINSI.filter((p) => p.kondisi === "kritis").length;

  const byKondisi = {
    baik:   DATA_PROVINSI.filter((p) => p.kondisi === "baik").sort((a, b) => b.luasTotal - a.luasTotal),
    sedang: DATA_PROVINSI.filter((p) => p.kondisi === "sedang").sort((a, b) => b.luasDegradasi - a.luasDegradasi),
    kritis: DATA_PROVINSI.filter((p) => p.kondisi === "kritis").sort((a, b) => b.luasDegradasi - a.luasDegradasi),
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
        <div className="w-9 h-9 bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Analisa Kondisi Ekosistem Mangrove</p>
          <p className="text-xs text-gray-500">Nasional & Per Provinsi · KLHK / PMN 2025</p>
        </div>
      </div>

      <div className="p-4 space-y-5">

        {/* ── Ringkasan Nasional ── */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Ringkasan Nasional</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Total Mangrove", value: `${(RINGKASAN_NASIONAL.totalLuasMangrove / 1_000_000).toFixed(2)} jt ha`, sub: `${RINGKASAN_NASIONAL.persentaseDunia}% mangrove dunia`, icon: Leaf, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Area Terdegradasi", value: `${fmt(RINGKASAN_NASIONAL.luasDegradasi)} ha`, sub: `${((RINGKASAN_NASIONAL.luasDegradasi / RINGKASAN_NASIONAL.totalLuasMangrove) * 100).toFixed(1)}% dari total`, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
              { label: "Realisasi Restorasi", value: `${fmt(RINGKASAN_NASIONAL.realisasiRestorasi)} ha`, sub: `${RINGKASAN_NASIONAL.persenRealisasi}% dari target PMN`, icon: TrendingUp, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Karbon Tersimpan", value: `${fmt(RINGKASAN_NASIONAL.karbon_tersimpan_MtCO2)} Mt`, sub: `Nilai Rp ${RINGKASAN_NASIONAL.nilaiEkosistem_TrilyunRp} T/tahun`, icon: Zap, color: "text-emerald-700", bg: "bg-emerald-50" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-lg p-3 border border-gray-100`}>
                  <Icon className={`w-4 h-4 ${s.color} mb-1.5`} />
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Progress bar kondisi ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Distribusi Kondisi ({total} Provinsi)</p>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            <div className="bg-emerald-600 flex items-center justify-center" style={{ width: `${(baik / total) * 100}%` }}>
              <span className="text-[9px] font-bold text-white">{baik}</span>
            </div>
            <div className="bg-amber-500 flex items-center justify-center" style={{ width: `${(sedang / total) * 100}%` }}>
              <span className="text-[9px] font-bold text-white">{sedang}</span>
            </div>
            <div className="bg-red-600 flex items-center justify-center" style={{ width: `${(kritis / total) * 100}%` }}>
              <span className="text-[9px] font-bold text-white">{kritis}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-1.5">
            {[
              { label: "Baik", n: baik, color: "text-emerald-700" },
              { label: "Sedang", n: sedang, color: "text-amber-600" },
              { label: "Kritis", n: kritis, color: "text-red-600" },
            ].map((k) => (
              <div key={k.label} className="flex items-center gap-1">
                <span className={`text-xs font-semibold ${k.color}`}>{k.n}</span>
                <span className="text-xs text-gray-400">{k.label} ({((k.n / total) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Kondisi Per Provinsi ── */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Kondisi Per Provinsi</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {(["baik", "sedang", "kritis"] as const).map((k) => {
              const cfg = KONDISI_CFG[k];
              return (
                <div key={k} className={`rounded-lg border ${cfg.border} ${cfg.light} p-3`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                    <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                    <span className={`ml-auto text-xs font-semibold ${cfg.text}`}>{byKondisi[k].length}</span>
                  </div>
                  <div className="space-y-1">
                    {byKondisi[k].map((p) => (
                      <div key={p.provinsi} className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-700 truncate max-w-[65%]">{p.provinsi}</span>
                        <span className="text-[10px] text-gray-400">{((p.luasDegradasi / p.luasTotal) * 100).toFixed(0)}% deg.</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Ancaman Utama ── */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Ancaman Utama Ekosistem</p>
          <div className="space-y-2">
            {ANCAMAN_MANGROVE.map((a) => {
              const cfg = ANCAMAN_CFG[a.tingkat];
              const maxLuas = Math.max(...ANCAMAN_MANGROVE.map((x) => x.luasTerdampak));
              const pct = Math.round((a.luasTerdampak / maxLuas) * 100);
              return (
                <div key={a.jenis}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{a.jenis}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{fmt(a.luasTerdampak)} ha/thn</span>
                      <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cfg.bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Potensi Blue Carbon ── */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-emerald-100 p-3">
          <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-2">Potensi Blue Carbon</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { label: "Stok Karbon", value: `${fmt(DATA_BLUE_CARBON.stokKarbon_tCO2_per_ha)} tCO₂`, sub: "per hektar" },
              { label: "Potensi Mitigasi", value: `${DATA_BLUE_CARBON.potensiMitigasi_MtCO2_tahun} Mt CO₂`, sub: "per tahun" },
              { label: "Nilai Karbon", value: `USD ${DATA_BLUE_CARBON.nilaiKarbon_USDperTon}`, sub: "per ton (2024)" },
              { label: "Proyek Aktif", value: `${DATA_BLUE_CARBON.proyekAktif}/${DATA_BLUE_CARBON.proyekTerdaftar}`, sub: "terdaftar SRN" },
            ].map((bc) => (
              <div key={bc.label}>
                <p className="text-base font-extrabold text-teal-800">{bc.value}</p>
                <p className="text-[10px] text-emerald-600 font-medium">{bc.label}</p>
                <p className="text-[10px] text-gray-400">{bc.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-right">Sumber: KLHK, PMN, BRGMN, KKMD 2025</p>
      </div>
    </div>
  );
}
