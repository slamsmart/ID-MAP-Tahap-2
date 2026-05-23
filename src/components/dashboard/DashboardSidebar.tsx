"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  CheckCircle,
  Globe,
  Users,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
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
  { icon: CheckCircle, label: "Sertifikat", href: "/user/sertifikat" },
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

const verifikatorItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/verifikator" },
  { icon: Brain, label: "Analisis AI", href: "/verifikator/analisis-ai" },
  { icon: Waves, label: "Data Abrasi Pantai", href: "/verifikator/abrasi" },
  { icon: Globe, label: "Titik Pendaratan Penyu", href: "/verifikator/penyu" },
  { icon: Users, label: "Data Pokmaswas", href: "/verifikator/pokmaswas" },
  { icon: ImageIcon, label: "Thumbnail Layanan", href: "/verifikator/thumbnail-layanan" },
  { icon: Settings, label: "Pengaturan", href: "/verifikator/pengaturan" },
];

interface DashboardSidebarProps {
  type: "admin" | "user" | "verifikator" | "mitra";
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
      : verifikatorItems;

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-900 rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-emerald-900">
            ID-MAP
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-emerald-700" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("idmap_session");
              window.location.href = "/";
            }
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Keluar
        </button>
      </div>
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
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-60 bg-white border-r border-gray-100 min-h-screen flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
