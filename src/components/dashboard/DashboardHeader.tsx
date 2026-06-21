"use client";

import { useRouter } from "next/navigation";
import { Leaf, BarChart2, AlertTriangle, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

const STATS = [
  {
    icon: Leaf,
    value: "3,36 jt ha",
    label: "Total Mangrove",
    sub: "20,3% mangrove dunia",
    iconCls: "text-emerald-400",
    glowCls: "bg-emerald-400/10",
  },
  {
    icon: BarChart2,
    value: "47,8%",
    label: "Realisasi PMN",
    sub: "287k ha dari 600k ha",
    iconCls: "text-sky-400",
    glowCls: "bg-sky-400/10",
  },
  {
    icon: AlertTriangle,
    value: "17",
    label: "Provinsi Kritis",
    sub: "dari 33 provinsi",
    iconCls: "text-amber-400",
    glowCls: "bg-amber-400/10",
  },
] as const;

interface Props {
  avatarInitials: string;
  avatarCls: string;
}

export default function DashboardHeader({ avatarInitials, avatarCls }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-[#0f3d2e] shadow-sm shadow-emerald-950/20">
      <div className="flex min-h-[68px] items-center gap-3 px-4 sm:px-6">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3 lg:gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/[0.03] sm:px-2"
            >
              <div
                className={`hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:flex ${s.glowCls}`}
              >
                <s.icon className={`h-4 w-4 ${s.iconCls}`} />
              </div>

              <div className="min-w-0">
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="shrink-0 text-base font-bold leading-none text-white">
                    {s.value}
                  </span>
                  <span className="hidden truncate text-[11px] leading-none text-white/60 md:inline">
                    {s.sub}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] leading-none text-white/72">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="ml-auto hidden items-center xl:flex">
          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
            Sumber: PMN / KKMD / BRGMN 2025
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
            aria-label="Keluar dari akun"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${avatarCls}`}
          >
            {avatarInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
