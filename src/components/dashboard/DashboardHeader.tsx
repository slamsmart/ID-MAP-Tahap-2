import { Leaf, BarChart2, AlertTriangle } from "lucide-react";

// Data mangrove nasional — PMN · KKMD · BRGMN 2025 (statis)
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
  title: string;
  avatarInitials: string;
  avatarCls: string;
}

export default function DashboardHeader({ title, avatarInitials, avatarCls }: Props) {
  return (
    <header className="bg-[#0c1a2e] border-b border-white/10 shadow-sm shadow-black/20">

      {/* ── Baris atas: judul + avatar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="md:hidden w-8" />
        <h2 className="font-display font-semibold text-white/90 text-sm tracking-wide">
          {title}
        </h2>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${avatarCls}`}
        >
          {avatarInitials}
        </div>
      </div>

      {/* ── Baris bawah: stats mangrove nasional ── */}
      <div className="flex items-stretch border-t border-white/[0.06] divide-x divide-white/[0.06]">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-1 items-center gap-2.5 px-4 sm:px-5 py-2.5 min-w-0 group hover:bg-white/[0.03] transition-colors"
          >
            {/* Icon bubble */}
            <div
              className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center flex-shrink-0 ${s.glowCls}`}
            >
              <s.icon className={`w-3.5 h-3.5 ${s.iconCls}`} />
            </div>

            {/* Text */}
            <div className="min-w-0">
              {/* Value + sub-text inline on wide screens */}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-white font-bold text-sm leading-none">
                  {s.value}
                </span>
                <span className="text-white/60 text-[10px] leading-none hidden md:inline truncate">
                  {s.sub}
                </span>
              </div>
              {/* Label */}
              <p className="text-white/70 text-[10px] mt-0.5 leading-none truncate">
                {s.label}
              </p>
            </div>
          </div>
        ))}

        {/* Source tag — hanya desktop */}
        <div className="hidden xl:flex items-center px-4 sm:px-5 flex-shrink-0">
          <span className="text-[9px] text-white/40 uppercase tracking-widest whitespace-nowrap">
            Sumber: PMN · KKMD · BRGMN 2025
          </span>
        </div>
      </div>
    </header>
  );
}
