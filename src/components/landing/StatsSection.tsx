"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Sprout, BarChart3, CircleDollarSign } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StatsSection() {
  const projectStats = useQuery(api.projects.getStats);
  const users = useQuery(api.users.list);
  const { t } = useLanguage();

  const isLoading = projectStats === undefined || users === undefined;

  // Real data calculations
  const totalUsers = users?.length || 0;
  const totalSeeds = projectStats?.totalSeeds || 0;
  const totalCo2 = projectStats?.totalCo2 || 0;
  
  // Calculate potential value based on current CO2 absorption and an average price of Rp 65,000 per ton
  const potentialValue = totalCo2 * 65000;

  const statsList = [
    {
      key: "komunitas_terlibat",
      label: t("Komunitas Terlibat", "Communities Involved"),
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
          className="rounded-[28px] shadow-2xl shadow-emerald-950/20 p-5 grid md:grid-cols-4 gap-4 text-white"
          style={{ background: "linear-gradient(90deg, #065F46 0%, #0D9488 100%)" }}
        >
          {isLoading
            ? statsList.map((stat) => (
                <div key={stat.key} className="flex items-center gap-4 px-4 py-3 md:border-r border-white/15 last:border-r-0 animate-pulse">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-white/20 rounded w-24" />
                    <div className="h-6 bg-white/20 rounded w-20" />
                  </div>
                </div>
              ))
            : statsList.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.key} className="flex items-center gap-4 px-4 py-3 md:border-r border-white/15 last:border-r-0">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-200 flex-shrink-0">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-100">{stat.label}</p>
                      <p className="text-2xl font-extrabold mt-1">
                        {stat.value} <span className="text-sm font-medium text-white/65">{stat.suffix}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
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
