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
      {/* pl-14 on mobile to clear the fixed hamburger button (left-3 + 40px width) */}
      <div className="flex min-h-[56px] items-center gap-2 pl-14 pr-3 sm:min-h-[68px] sm:gap-3 sm:px-6">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-1 gap-y-0 sm:gap-2 lg:gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 transition-colors hover:bg-white/[0.03] sm:gap-2.5 sm:px-2 sm:py-1.5"
            >
              <div
                className={`hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:flex ${s.glowCls}`}
              >
                <s.icon className={`h-4 w-4 ${s.iconCls}`} />
              </div>

              <div className="min-w-0">
                <div className="flex min-w-0 items-baseline gap-1">
                  <span className="shrink-0 text-[11px] font-bold leading-none text-white sm:text-base">
                    {s.value}
                  </span>
                  <span className="hidden truncate text-[11px] leading-none text-white/60 md:inline">
                    {s.sub}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[9px] leading-none text-white/70 sm:mt-1 sm:text-[11px]">
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

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/60 sm:h-9 sm:gap-2 sm:px-3 sm:text-sm"
            aria-label="Keluar dari akun"
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold sm:h-10 sm:w-10 sm:text-base ${avatarCls}`}
          >
            {avatarInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
