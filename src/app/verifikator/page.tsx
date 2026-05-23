"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ABRASION_SITES } from "@/lib/abrasionData";
import { TITIK_PENDARATAN_PENYU } from "@/lib/penyuData";
import { Waves, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import MangroveAIPanel from "@/components/dashboard/MangroveAIPanel";

export default function VerifikatorDashboard() {
  const [name, setName] = useState("Verifikator");

  useEffect(() => {
    const s = getSession();
    if (s?.name) setName(s.name);
  }, []);

  const totalAbrasi = ABRASION_SITES.length;
  const abrasiTinggi = ABRASION_SITES.filter((s) => s.prioritas === "Tinggi").length;
  const abrasiSedang = ABRASION_SITES.filter((s) => s.prioritas === "Sedang").length;
  const abrasiRendah = ABRASION_SITES.filter((s) => s.prioritas === "Rendah–Sedang").length;

  const totalPenyu = TITIK_PENDARATAN_PENYU.length;
  const pantaiPenyu = Array.from(new Set(TITIK_PENDARATAN_PENYU.map((t) => t.pantai))).length;
  const jenisPenyu = Array.from(new Set(TITIK_PENDARATAN_PENYU.map((t) => t.jenisPenyu))).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-gray-900">Halo, {name}</h1>
        <p className="text-sm text-gray-500">Kelola dan verifikasi data ekosistem pesisir Jawa Timur.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Lokasi Abrasi</p>
          <p className="font-bold text-2xl text-gray-900">{totalAbrasi}</p>
          <p className="text-[10px] text-gray-400">lokasi pantai</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4">
          <p className="text-xs text-red-500 mb-1">Prioritas Tinggi</p>
          <p className="font-bold text-2xl text-red-600">{abrasiTinggi}</p>
          <p className="text-[10px] text-gray-400">butuh rehabilitasi segera</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Sarang Penyu</p>
          <p className="font-bold text-2xl text-teal-700">{totalPenyu}</p>
          <p className="text-[10px] text-gray-400">{pantaiPenyu} pantai · {jenisPenyu} jenis</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <p className="font-bold text-sm text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Data Aktif
          </p>
          <p className="text-[10px] text-gray-400">Terakhir diperbarui hari ini</p>
        </div>
      </div>

      {/* Quick access */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Abrasi */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Waves className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Data Abrasi Pantai</h3>
                <p className="text-[10px] text-gray-500">{totalAbrasi} lokasi · Jawa Timur</p>
              </div>
            </div>
            <Link href="/verifikator/abrasi" className="flex items-center gap-1 text-xs text-orange-600 font-semibold hover:text-orange-700">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
              <p className="font-bold text-lg text-red-600">{abrasiTinggi}</p>
              <p className="text-[10px] text-red-500">Tinggi</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-lg p-3 text-center">
              <p className="font-bold text-lg text-amber-600">{abrasiSedang}</p>
              <p className="text-[10px] text-amber-500">Sedang</p>
            </div>
            <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
              <p className="font-bold text-lg text-blue-600">{abrasiRendah}</p>
              <p className="text-[10px] text-blue-500">Rendah–Sedang</p>
            </div>
          </div>
        </div>

        {/* Penyu */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-xl">
                🐢
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Titik Pendaratan Penyu</h3>
                <p className="text-[10px] text-gray-500">{totalPenyu} sarang · {pantaiPenyu} pantai</p>
              </div>
            </div>
            <Link href="/verifikator/penyu" className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-700">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {Array.from(new Set(TITIK_PENDARATAN_PENYU.map((t) => t.pantai))).map((pantai) => {
              const count = TITIK_PENDARATAN_PENYU.filter((t) => t.pantai === pantai).length;
              return (
                <div key={pantai} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{pantai}</span>
                  <span className="font-bold text-teal-700">{count} sarang</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Perhatian: {abrasiTinggi} lokasi prioritas tinggi</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Sendang Biru, Tamban, dan Pantai Mini memerlukan rehabilitasi segera.
            Pastikan data survei terbaru sudah diperbarui.
          </p>
        </div>
      </div>

      <MangroveAIPanel role="verifikator" />
    </div>
  );
}
