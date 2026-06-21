"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Sprout, Trophy, Loader2 } from "lucide-react";
import { getSession, User } from "@/lib/auth";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import CheckInCard from "@/components/dashboard/gamification/CheckInCard";
import ReferralCard from "@/components/dashboard/gamification/ReferralCard";
import Leaderboard from "@/components/dashboard/gamification/Leaderboard";

// Tanggal hari ini zona Asia/Jakarta (UTC+7) — dikirim ke query karena
// Convex query tidak boleh memanggil Date.now() sendiri.
function jakartaToday(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default function GamifikasiPage() {
  const [session, setSession] = useState<User | null>(null);
  const [today] = useState(jakartaToday);

  useEffect(() => setSession(getSession()), []);
  const userId = session?._id as Id<"users"> | undefined;

  const gam = useQuery(
    api.gamification.getUserGamification,
    userId ? { userId, today } : "skip"
  );
  const leaderboard = useQuery(api.gamification.getLeaderboard);
  const ensureCode = useMutation(api.gamification.ensureReferralCode);

  // Backfill kode referral untuk user lama yang belum punya.
  useEffect(() => {
    if (userId && gam && gam.referralCode === null) {
      ensureCode({ userId }).catch(() => {});
    }
  }, [userId, gam, ensureCode]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://id-map.app";

  const loading = gam === undefined || leaderboard === undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Gamifikasi
          </h1>
          <p className="text-sm text-gray-500">
            Kumpulkan poin, ajak teman, tukar jadi bibit mangrove nyata.
          </p>
        </div>
        {gam && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <div className="leading-tight">
              <p className="font-display font-bold text-xl text-emerald-800">
                {gam.totalSeedlings}
              </p>
              <p className="text-[10px] text-gray-500 -mt-0.5">Total Bibit</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {gam && userId && <CheckInCard gam={gam} userId={userId} />}
            {gam && <ReferralCard gam={gam} siteUrl={siteUrl} />}
          </div>

          <Leaderboard rows={leaderboard ?? []} currentUserId={userId} />
        </>
      )}
    </div>
  );
}
