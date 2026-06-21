"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Flame, Sprout, CalendarCheck, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type Gam = {
  points: number;
  checkInStreak: number;
  bestStreak: number;
  checkInTotal: number;
  canCheckInToday: boolean;
  daysToNextCheckinSeedling: number;
  seedlingsCheckin: number;
};

export default function CheckInCard({
  gam,
  userId,
}: {
  gam: Gam;
  userId: Id<"users">;
}) {
  const checkIn = useMutation(api.gamification.dailyCheckIn);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handle = async () => {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const r = await checkIn({ userId });
      setMsg(
        r.awardedSeedling
          ? `Mantap! Streak ${r.streak} hari — kamu dapat 1 bibit mangrove 🌱`
          : `+${r.pointsGained} poin! Streak ${r.streak} hari. Sampai jumpa besok.`
      );
    } catch (e: unknown) {
      const m =
        (e as { data?: { message?: string } })?.data?.message ??
        "Gagal check-in. Coba lagi.";
      setErr(m);
    } finally {
      setBusy(false);
    }
  };

  // Progress menuju bibit berikut (kelipatan 15).
  const inCycle = 15 - gam.daysToNextCheckinSeedling;
  const pct = Math.round((inCycle / 15) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-gray-800 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-emerald-600" />
          Check-in Harian
        </h3>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="w-5 h-5" />
          <span className="font-display font-bold text-lg">{gam.checkInStreak}</span>
          <span className="text-xs text-gray-400">hari</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="bg-emerald-50 rounded-lg py-2">
          <p className="font-display font-bold text-emerald-800">{gam.points}</p>
          <p className="text-[10px] text-gray-500">Poin</p>
        </div>
        <div className="bg-emerald-50 rounded-lg py-2">
          <p className="font-display font-bold text-emerald-800">{gam.bestStreak}</p>
          <p className="text-[10px] text-gray-500">Streak Terbaik</p>
        </div>
        <div className="bg-emerald-50 rounded-lg py-2">
          <p className="font-display font-bold text-emerald-800 flex items-center justify-center gap-0.5">
            <Sprout className="w-3.5 h-3.5" />
            {gam.seedlingsCheckin}
          </p>
          <p className="text-[10px] text-gray-500">Bibit</p>
        </div>
      </div>

      {/* Progress menuju bibit (15 hari beruntun) */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Menuju bibit berikutnya</span>
          <span className="font-semibold text-emerald-700">
            {gam.daysToNextCheckinSeedling} hari lagi
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Check-in 15 hari beruntun = 1 bibit mangrove. Bolong = streak reset.
        </p>
      </div>

      <button
        onClick={handle}
        disabled={!gam.canCheckInToday || busy}
        className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
          gam.canCheckInToday && !busy
            ? "bg-lime-400 hover:bg-lime-300 text-slate-900"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CalendarCheck className="w-4 h-4" />
        )}
        {gam.canCheckInToday ? "Check-in Hari Ini" : "Sudah Check-in Hari Ini ✓"}
      </button>

      {msg && <p className="mt-2 text-xs text-emerald-700 text-center">{msg}</p>}
      {err && <p className="mt-2 text-xs text-red-600 text-center">{err}</p>}
    </div>
  );
}
