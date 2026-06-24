"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Sprout, BarChart3, CircleDollarSign } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StatsSection() {
  const projectStats = useQuery(api.projects.getStats);
  const userStats = useQuery(api.users.getStats);
  const { t } = useLanguage();

  const isLoading = projectStats === undefined || userStats === undefined;

  const totalUsers = userStats?.total || 0;
  const totalSeeds = projectStats?.totalSeeds || 0;
  const totalCo2 = projectStats?.totalCo2 || 0;
  
  // Calculate potential value based on current CO2 absorption and an average price of Rp 65,000 per ton
  const potentialValue = totalCo2 * 65000;

  const statsList = [
    {
      key: "sahabat_terlibat",
      label: t("Sahabat Terlibat", "Sahabat Involved"),
      value: formatNumber(totalUsers),
      suffix: t("Orang", "People"),
      icon: Users,
    },
    {
      key: "bibit_ditanam",
      label: t("Bibit Mangrove Ditanam", "Mangrove Seedlings Planted"),
      value: formatNumber(totalSeeds),
      suffix: t("Pohon", "Trees"),
      icon: Sprout,
    },
    {
      key: "serapan_karbon",
      label: t("Serapan Karbon (CO₂e)", "Carbon Absorption (CO₂e)"),
      value: formatNumber(totalCo2),
      suffix: t("Ton", "Tons"),
      icon: BarChart3,
    },
    {
      key: "potensi_nilai_carbon",
      label: t("Potensi Nilai Carbon", "Carbon Value Potential"),
      value: `${(potentialValue / 1000000).toFixed(0)}`,
      suffix: t("Juta IDR", "M IDR"),
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="relative -mt-4 z-30">
      <div className="mx-auto max-w-7xl px-6 pb-8">
        <div
          className="rounded-[28px] shadow-2xl shadow-emerald-950/20 px-2 py-4 grid md:grid-cols-4 gap-0 text-white"
          style={{ background: "linear-gradient(90deg, #065F46 0%, #0D9488 100%)" }}
        >
          {isLoading
            ? statsList.map((stat) => (
                <div key={stat.key} className="flex flex-col px-6 py-4 md:border-r border-white/15 last:border-r-0 animate-pulse">
                  <div className="h-8 bg-white/20 rounded w-28 mb-2" />
                  <div className="h-3 bg-white/15 rounded w-20" />
                </div>
              ))
            : statsList.map((stat) => (
                <div key={stat.key} className="flex flex-col px-6 py-4 md:border-r border-white/15 last:border-r-0">
                  <p className="text-3xl font-extrabold text-white leading-none">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-base font-semibold text-white/70 ml-1">{stat.suffix}</span>
                    )}
                  </p>
                  <p className="text-sm text-emerald-100/80 mt-2 leading-snug">{stat.label}</p>
                </div>
              ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">
          {t(
            "*Data didasarkan pada agregasi total proyek terdaftar dan pengguna ID-MAP.",
            "*Data based on aggregated registered projects and ID-MAP users."
          )}
        </p>
      </div>
    </section>
  );
}
