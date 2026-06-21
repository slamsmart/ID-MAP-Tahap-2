"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FolderTree,
  CheckCircle,
  Globe,
  Users,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Menu,
  X,
  FileText,
  Wallet,
  Bell,
  Sprout,
  ImageIcon,
  ShieldCheck,
  Waves,
  Brain,
  PanelBottom,
  PanelTop,
  LayoutGrid,
  HelpCircle,
  Building2,
  FileBadge,
  Calculator,
  Trophy,
} from "lucide-react";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const adminItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Brain, label: "Analisis AI", href: "/admin/analisis-ai" },
  { icon: FolderTree, label: "Proyek", href: "/admin/proyek" },
  { icon: CheckCircle, label: "Verifikasi KYC", href: "/admin/verifikasi" },
  { icon: Users, label: "Pengguna", href: "/admin/pengguna" },
  { icon: ArrowRightLeft, label: "Transaksi", href: "/admin/transaksi" },
  { icon: ImageIcon, label: "Header Image", href: "/admin/header" },
  { icon: Settings, label: "Pengaturan", href: "/admin/pengaturan" },
];

const userItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Beranda", href: "/user" },
  { icon: Brain, label: "Analisis AI", href: "/user/analisis-ai" },
  { icon: FolderTree, label: "Proyek", href: "/user/proyek" },
  { icon: Globe, label: "Riwayat Scan", href: "/user/riwayat" },
  { icon: ArrowRightLeft, label: "Donasi & Kontribusi", href: "/user/donasi" },
  { icon: BarChart3, label: "Dampak Saya", href: "/user/dampak" },
  { icon: Trophy, label: "Gamifikasi", href: "/user/gamifikasi" },
  { icon: CheckCircle, label: "Sertifikat", href: "/user/sertifikat" },
  { icon: ShieldCheck, label: "Lengkapi KYC", href: "/user/kyc" },
  { icon: Bell, label: "Pemberitahuan", href: "/user/notifikasi" },
  { icon: Settings, label: "Pengaturan", href: "/user/pengaturan" },
];

const mitraItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/mitra" },
  { icon: Brain, label: "Analisis AI", href: "/mitra/analisis-ai" },
  { icon: ShieldCheck, label: "Verifikasi KYC", href: "/mitra/kyc" },
  { icon: FolderTree, label: "Proyek Saya", href: "/mitra/proyek" },
  { icon: Sprout, label: "Tambah Proyek", href: "/mitra/proyek-baru" },
  { icon: CheckCircle, label: "MRV & Verifikasi", href: "/mitra/mrv" },
  { icon: Wallet, label: "Pendanaan", href: "/mitra/pendanaan" },
  { icon: FileText, label: "Laporan", href: "/mitra/laporan" },
  { icon: Settings, label: "Pengaturan", href: "/mitra/pengaturan" },
];

const corporateItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/corporate" },
  { icon: Building2, label: "Portofolio ESG", href: "/corporate/portofolio" },
  { icon: Calculator, label: "Estimasi", href: "/corporate/estimasi" },
  { icon: Wallet, label: "Beli Kontribusi", href: "/corporate/beli" },
  { icon: FileBadge, label: "Dokumen", href: "/corporate/dokumen" },
  { icon: ArrowRightLeft, label: "Transaksi", href: "/corporate/transaksi" },
  { icon: Settings, label: "Pengaturan", href: "/corporate/pengaturan" },
];

const verifikatorItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/verifikator" },
  { icon: Brain, label: "Analisis AI", href: "/verifikator/analisis-ai" },
  { icon: FolderTree, label: "Audit Proyek", href: "/verifikator/proyek" },
  { icon: Waves, label: "Data Abrasi Pantai", href: "/verifikator/abrasi" },
  { icon: Globe, label: "Titik Pendaratan Penyu", href: "/verifikator/penyu" },
  { icon: Users, label: "Data Pokmaswas", href: "/verifikator/pokmaswas" },
  { icon: PanelTop, label: "Hero Beranda", href: "/verifikator/landing-hero" },
  { icon: FileText, label: "Halaman Tentang", href: "/verifikator/tentang" },
  { icon: HelpCircle, label: "Halaman FAQ", href: "/verifikator/faq" },
  { icon: ImageIcon, label: "Konten Layanan", href: "/verifikator/thumbnail-layanan" },
  { icon: LayoutGrid, label: "Tiga Peran", href: "/verifikator/tiga-peran" },
  { icon: PanelBottom, label: "Footer Brand", href: "/verifikator/footer" },
  { icon: Settings, label: "Pengaturan", href: "/verifikator/pengaturan" },
];

interface DashboardSidebarProps {
  type: "admin" | "user" | "verifikator" | "mitra" | "corporate";
}

export default function DashboardSidebar({ type }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items =
    type === "admin"
      ? adminItems
      : type === "user"
      ? userItems
      : type === "mitra"
      ? mitraItems
      : type === "corporate"
      ? corporateItems
      : verifikatorItems;

  const sidebarContent = (
    <>
      <div className="relative px-4 h-16 border-b border-white/10 flex items-center justify-center">
        <Link href="/" className="flex items-center" aria-label="Beranda ID-MAP">
          <Image
            src="/images/logo-white.png"
            alt="ID-MAP"
            width={470}
            height={428}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <Link
                  href={item.href}
                  prefetch
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-lime-400 rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-lime-300" : "text-white/50 group-hover:text-white/80"
                    }`}
                  />
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    {item.label}
                  </span>
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-300" />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-60 bg-[#0f3d2e] border-r border-white/10 min-h-screen flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
