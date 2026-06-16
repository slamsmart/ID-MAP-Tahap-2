"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSession, logout, getDashboardPath, User } from "@/lib/auth";

const navLinks = [
  { href: "/", idLabel: "Beranda", enLabel: "Home" },
  { href: "/jelajahi-peta-mangrove", idLabel: "Jelajahi Peta Restorasi Lingkungan", enLabel: "Explore Environmental Restoration Map" },
  { href: "/tentang", idLabel: "Tentang Kami", enLabel: "About Us" },
  { href: "/mitra-kami", idLabel: "Mitra", enLabel: "Partners" },
  { href: "/faq", idLabel: "FAQ", enLabel: "FAQ" },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [session, setSession] = useState<User | null>(null);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    setSession(getSession());
    const onChange = () => setSession(getSession());
    window.addEventListener("session:change", onChange);
    return () => window.removeEventListener("session:change", onChange);
  }, []);

  const handleLogout = async () => {
    await logout();
    setSession(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-emerald-900/10">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="ID-MAP - Mangrove & Pesisir untuk Ekosistem Karbon Indonesia">
          <span className="inline-flex items-center justify-center h-20 w-20 md:h-24 md:w-24 rounded-full bg-white p-1">
            <Image
              src="/images/logo2.webp"
              alt="ID-MAP"
              width={192}
              height={192}
              className="h-full w-full object-contain"
              priority
            />
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9 text-sm font-semibold text-black">
          {navLinks.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.idLabel}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative transition-colors hover:text-[#0f3d2e] ${
                  active ? "text-[#0f3d2e]" : ""
                }`}
              >
                {t(link.idLabel, link.enLabel)}
                {active && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-full border border-emerald-100 mr-2">
            <button 
              onClick={() => setLanguage("id")}
              aria-pressed={language === 'id'}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${language === 'id' ? 'bg-[#0f3d2e] text-white shadow-md' : 'text-emerald-800 hover:bg-emerald-100'}`}
            >
              ID
            </button>
            <button 
              onClick={() => setLanguage("en")}
              aria-pressed={language === 'en'}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${language === 'en' ? 'bg-[#0f3d2e] text-white shadow-md' : 'text-emerald-800 hover:bg-emerald-100'}`}
            >
              EN
            </button>
          </div>
          
          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href={getDashboardPath(session.role)}
                className="flex items-center gap-2 text-sm font-bold text-[#0f3d2e] hover:text-emerald-700 transition"
              >
                <UserCircle className="w-5 h-5" aria-hidden="true" />
                <span>Dashboard ({session.name.split(" ")[0]})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/masuk"
                className="rounded-full border-2 border-[#0f3d2e] px-7 py-3 text-sm font-bold text-[#0f3d2e] hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {t("Masuk", "Log In")}
              </Link>
              <Link
                href="/daftar"
                className="rounded-full bg-[#0f3d2e] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-[#14523d] transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {t("Daftar", "Sign Up")}
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu navigasi"}
          className="lg:hidden p-2 text-gray-600"
        >
          {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-2">
          <div className="flex items-center justify-center gap-2 bg-emerald-50 p-1 rounded-full border border-emerald-100 mb-4">
            <button 
              onClick={() => setLanguage("id")}
              aria-pressed={language === 'id'}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition ${language === 'id' ? 'bg-[#0f3d2e] text-white shadow-md' : 'text-emerald-800'}`}
            >
              ID
            </button>
            <button 
              onClick={() => setLanguage("en")}
              aria-pressed={language === 'en'}
              className={`flex-1 py-2 text-sm font-bold rounded-full transition ${language === 'en' ? 'bg-[#0f3d2e] text-white shadow-md' : 'text-emerald-800'}`}
            >
              EN
            </button>
          </div>
          {navLinks.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.idLabel}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block px-4 py-2.5 text-sm font-semibold rounded-lg ${
                  active
                    ? "text-[#0f3d2e] bg-emerald-50"
                    : "text-black hover:bg-emerald-50 hover:text-[#0f3d2e]"
                }`}
              >
                {t(link.idLabel, link.enLabel)}
              </Link>
            );
          })}
          <div className="flex gap-3 pt-4">
            {session ? (
              <div className="flex w-full gap-3">
                <Link
                  href={getDashboardPath(session.role)}
                  className="flex-1 text-center px-4 py-3 text-sm font-bold text-white bg-[#0f3d2e] rounded-full"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 text-center px-4 py-3 text-sm font-bold text-red-600 border-2 border-red-600 rounded-full"
                >
                  {t("Keluar", "Log Out")}
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/masuk"
                  className="flex-1 text-center px-4 py-3 text-sm font-bold text-[#0f3d2e] border-2 border-[#0f3d2e] rounded-full"
                >
                  {t("Masuk", "Log In")}
                </Link>
                <Link
                  href="/daftar"
                  className="flex-1 text-center px-4 py-3 text-sm font-bold text-white bg-[#0f3d2e] rounded-full"
                >
                  {t("Daftar", "Sign Up")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
