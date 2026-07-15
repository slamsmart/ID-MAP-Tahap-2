"use client";

import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Cloud,
  Users,
  BookOpen,
  ChevronRight,
  Lock,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function Footer() {
  const { t } = useLanguage();
  const footerData = useQuery(api.footerContent.get);

  const brandName = footerData?.brandName ?? "ID-MAP";
  const descId = footerData?.descriptionId ?? "Platform Integrasi Data dan Manajemen Pesisir. Menghubungkan komunitas, mitra pelaksana, dan donatur untuk pemantauan, rehabilitasi, dan keberlanjutan pesisir nusantara.";
  const descEn = footerData?.descriptionEn ?? "Integrated Coastal Data & Management Platform. Connecting communities, project partners, and supporters for monitoring, rehabilitation, and sustainability of Indonesia's coast.";
  const email = footerData?.email ?? "info@id-map.co.id";
  const phone = footerData?.phone ?? "+62 21 1234 5678";
  const address = footerData?.address ?? "Jakarta, Indonesia";

  return (
    <footer className="bg-[#0a1c15] text-white">
      {/* CTA Banner */}
      <ScrollReveal as="div" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative overflow-hidden rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
             style={{
               background: "rgba(255, 255, 255, 0.05)",
               backdropFilter: "blur(24px)",
               WebkitBackdropFilter: "blur(24px)",
               border: "1px solid rgba(255, 255, 255, 0.15)",
               boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
             }}>

          <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6 w-full md:w-auto">
            <Image
              src="/images/logo-white.png"
              alt="ID-MAP"
              width={470}
              height={428}
              className="hidden sm:block h-20 w-auto object-contain shrink-0"
            />
            <div>
              <h3 className="font-semibold text-3xl md:text-4xl mb-2 text-white">
                {t("Terus Dukung Proyek", "Keep Supporting")}<br/>
                {t("Mangrove Indonesia", "Indonesia's Mangrove Projects")}
              </h3>
              <p className="text-emerald-50 text-sm md:text-base font-normal mb-6">
                {t("Setiap aksi kecil Anda, berdampak besar untuk masa depan bumi.", "Every small action you take has a big impact on the future of our planet.")}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-emerald-300" />
                  </div>
                  {t("Pulihkan Ekosistem", "Restore Ecosystems")}
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-emerald-300" />
                  </div>
                  {t("Serap Karbon", "Absorb Carbon")}
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-300" />
                  </div>
                  {t("Berdayakan Komunitas", "Empower Communities")}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center md:items-end w-full md:w-auto">
            <Link href="/daftar" className="flex items-center justify-center gap-3 px-8 py-4 w-full md:w-auto bg-white text-emerald-900 font-sans font-bold rounded-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 shadow-xl">
              {t("Dukung Proyek Sekarang", "Support Projects Now")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 mt-4 text-emerald-100 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {t("Aman, transparan, dan terpercaya", "Safe, transparent, and trusted")}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Footer Links */}
      <div className="border-t border-white/10">
        <ScrollReveal as="div" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/images/logo-white.png"
                  alt="ID-MAP"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <span className="font-sans font-bold text-2xl tracking-tight">{brandName}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {t(descId, descEn)}
              </p>
              <div className="space-y-3 text-sm text-emerald-100 mb-8 font-medium">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  {email}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  {phone}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {address}
                </div>
              </div>
            </div>

            {/* Platform */}
            <div className="md:pl-8 border-l border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-900/50 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-sans font-bold text-lg">{t("Platform", "Platform")}</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                {[
                  { label: "Jelajahi Proyek", href: "/jelajahi-peta-mangrove" },
                  { label: "Untuk Komunitas", href: "/proyek" },
                  { label: "Untuk Perusahaan", href: "/corporate" },
                  { label: "Kalkulator Karbon", href: "/jelajahi-peta-mangrove" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="flex items-center justify-between hover:text-white group">
                      <span>{t(item.label, item.label)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="md:pl-8 border-l border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-900/50 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-sans font-bold text-lg">{t("Sumber Daya", "Resources")}</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                {[
                  { label: "Berita Terkini", href: "/berita-terkini" },
                  { label: "FAQ", href: "/faq" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="flex items-center justify-between hover:text-white group">
                      <span>{t(item.label, item.label)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="md:pl-8 border-l border-white/5">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-900/50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-sans font-bold text-lg">{t("Legal", "Legal")}</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                {[
                  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
                  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
                  { label: "Tentang Kami", href: "/tentang" },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="flex items-center justify-between hover:text-white group">
                      <span>{t(item.label, item.label)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Social Links */}
      <div className="border-t border-white/10 bg-[#07140f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-white">
                {t("Ikuti ID-MAP Nusantara", "Follow ID-MAP Nusantara")}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {t(
                  "Update kegiatan, edukasi pesisir, dan publikasi terbaru.",
                  "Updates on coastal work, education, and latest publications."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/idmapnusantara/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-50 transition-colors hover:border-emerald-500 hover:bg-emerald-600"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5z"/></svg>
                <span>Instagram</span>
              </a>

              <a
                href="https://x.com/idmapnusantara"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-50 transition-colors hover:border-emerald-500 hover:bg-emerald-600"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2H21.5l-7.11 8.129L22.75 22h-6.543l-5.123-6.69L5.233 22H1.975l7.606-8.694L1.25 2h6.709l4.63 6.11L18.244 2zm-1.142 18h1.804L6.978 3.894H5.043L17.102 20z"/></svg>
                <span>X / Twitter</span>
              </a>

              <a
                href="https://www.youtube.com/@IDMAPNusantara"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-50 transition-colors hover:border-emerald-500 hover:bg-emerald-600"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.873.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Badges */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 font-medium">
              <Image
                src="/images/logo-white.png"
                alt="ID-MAP"
                width={24}
                height={24}
                className="h-6 w-6 object-contain opacity-70"
              />
              <div className="text-center sm:text-left">
                &copy; {new Date().getFullYear()} ID-MAP. {t("Hak cipta dilindungi.", "All rights reserved.")}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 sm:gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-xs text-gray-400">
                  {t("Keamanan Data", "Data Security")}<br/>
                  <span className="font-medium text-emerald-50">{t("Terjamin", "Guaranteed")}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-xs text-gray-400">
                  {t("Transparansi", "Transparency")}<br/>
                  <span className="font-medium text-emerald-50">{t("Terbuka", "Open")}</span>
                </div>
              </div>
               <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-xs text-gray-400">
                  {t("Dampak Nyata", "Real Impact")}<br/>
                  <span className="font-medium text-emerald-50">{t("Terukur", "Measured")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
