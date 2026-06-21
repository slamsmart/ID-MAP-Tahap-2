"use client";

import { useState } from "react";
import { Users, Copy, Check, Sprout, ShieldCheck, Clock } from "lucide-react";

type Gam = {
  referralCode: string | null;
  verifiedReferralCount: number;
  pendingReferralCount: number;
  referralsToNextSeedling: number;
  seedlingsReferral: number;
};

export default function ReferralCard({
  gam,
  siteUrl,
}: {
  gam: Gam;
  siteUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const code = gam.referralCode ?? "—";
  const link = gam.referralCode
    ? `${siteUrl}/referral/${gam.referralCode}`
    : "";

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — abaikan */
    }
  };

  // Progress menuju bibit (kelipatan 10 referral ter-KYC).
  const inCycle = 10 - gam.referralsToNextSeedling;
  const pct = Math.round((inCycle / 10) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-display font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-emerald-600" />
        Ajak Teman (Referral)
      </h3>

      {/* Kode + salin link */}
      <div className="bg-[#0f3d2e] rounded-lg p-3 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-emerald-200 mb-1">
          Kode referral kamu
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-xl text-lime-300 tracking-wide">
            {code}
          </span>
          <button
            onClick={copy}
            disabled={!link}
            className="inline-flex items-center gap-1.5 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-slate-900 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Tersalin" : "Salin Link"}
          </button>
        </div>
      </div>

      {/* Statistik referral */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="bg-emerald-50 rounded-lg py-2">
          <p className="font-display font-bold text-emerald-800 flex items-center justify-center gap-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {gam.verifiedReferralCount}
          </p>
          <p className="text-[10px] text-gray-500">Ter-KYC</p>
        </div>
        <div className="bg-amber-50 rounded-lg py-2">
          <p className="font-display font-bold text-amber-700 flex items-center justify-center gap-0.5">
            <Clock className="w-3.5 h-3.5" />
            {gam.pendingReferralCount}
          </p>
          <p className="text-[10px] text-gray-500">Belum KYC</p>
        </div>
        <div className="bg-emerald-50 rounded-lg py-2">
          <p className="font-display font-bold text-emerald-800 flex items-center justify-center gap-0.5">
            <Sprout className="w-3.5 h-3.5" />
            {gam.seedlingsReferral}
          </p>
          <p className="text-[10px] text-gray-500">Bibit</p>
        </div>
      </div>

      {/* Progress menuju bibit */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Menuju bibit berikutnya</span>
          <span className="font-semibold text-emerald-700">
            {gam.referralsToNextSeedling} orang lagi
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          10 teman yang <b>selesai KYC</b> = 1 bibit mangrove. Sekadar daftar email
          belum dihitung.
        </p>
      </div>
    </div>
  );
}
