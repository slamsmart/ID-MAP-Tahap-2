"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Trophy, Loader2, Sprout } from "lucide-react";
import { getSession, User } from "@/lib/auth";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Leaderboard from "@/components/dashboard/gamification/Leaderboard";
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function LeaderboardPage() {
  const [session, setSession] = useState<User | null>(null);
  useEffect(() => setSession(getSession()), []);
  const userId = session?._id as Id<"users"> | undefined;

  const rows = useQuery(api.gamification.getLeaderboard);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Hero */}
        <section className="bg-[#0f3d2e] text-white py-16 sm:py-20">
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-400/15 px-4 py-2 text-sm font-semibold text-lime-300 mb-4">
              <Trophy className="w-4 h-4" />
              Papan Peringkat
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Papan Peringkat Sahabat Pesisir
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">
              Peringkat berdasarkan total poin: check-in harian dan bonus referral
              ter-KYC. Ajak lebih banyak teman, naik ke puncak.
            </p>
          </ScrollReveal>
        </section>

        {/* Tabel */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            {rows === undefined ? (
              <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Memuat peringkat...
              </div>
            ) : (
              <ScrollReveal>
                <Leaderboard rows={rows} currentUserId={userId} />
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Mau Masuk Papan Peringkat?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Daftar sebagai Sahabat Pesisir, check-in harian, dan ajak teman untuk
              mengumpulkan poin dan bibit mangrove nyata.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/daftar?peran=sahabat"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-8 py-3.5 text-sm font-bold text-emerald-950 hover:bg-lime-300 shadow-lg shadow-lime-500/30 transition"
              >
                <Sprout className="w-4 h-4" />
                Daftar sebagai Sahabat
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f3d2e] px-8 py-3.5 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition"
              >
                Kembali ke Beranda
              </a>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
