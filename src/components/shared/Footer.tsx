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
      <ScrollReveal as="div" once className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              <h3 className="font-display font-bold text-3xl md:text-4xl mb-2 text-white">
                {t("Terus Dukung Proyek", "Keep Supporting")}<br/>
                {t("Mangrove Indonesia", "Indonesia's Mangrove Projects")}
              </h3>
              <p className="text-emerald-50 text-sm md:text-base font-medium mb-6">
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
            <Link href="/daftar" className="flex items-center justify-center gap-3 px-8 py-4 w-full md:w-auto bg-white text-emerald-900 font-display font-bold rounded-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 shadow-xl">
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
        <ScrollReveal as="div" once className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight">{brandName}</span>
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
              
              <div className="flex gap-3">
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-colors group">
                  <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-colors group">
                  <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-colors group">
                  <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-colors group">
                  <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div className="md:pl-8 border-l border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-900/50 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-display font-bold text-lg">{t("Platform", "Platform")}</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                {["Jelajahi Proyek", "Untuk Komunitas", "Untuk Perusahaan", "Kalkulator Karbon"].map((item, idx) => (
                  <li key={idx}>
                    <Link href="#" className="flex items-center justify-between hover:text-white group">
                      <span>{t(item, item)}</span>
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
                <h4 className="font-display font-bold text-lg">{t("Sumber Daya", "Resources")}</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                {[
                  { label: "Edukasi Pengelolaan Kawasan Ekosistem Pesisir", href: "/edukasi-ekosistem-pesisir" },
                  { label: "FAQ", href: "#" },
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
                <h4 className="font-display font-bold text-lg">{t("Legal", "Legal")}</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                {["Kebijakan Privasi", "Syarat & Ketentuan", "Tentang Kami"].map((item, idx) => (
                  <li key={idx}>
                    <Link href="#" className="flex items-center justify-between hover:text-white group">
                      <span>{t(item, item)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Copyright & Badges */}
      <div className="border-t border-white/10 bg-black/20">
        <ScrollReveal as="div" once className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 font-medium">
              <Leaf className="w-6 h-6 text-emerald-600" />
              <div className="text-center sm:text-left">
                &copy; {new Date().getFullYear()} ID-MAP. {t("Hak cipta dilindungi.", "All rights reserved.")}<br/>
                <span className="text-gray-600">Pre-Market Carbon Infrastructure Platform.</span>
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
        </ScrollReveal>
      </div>
    </footer>
  );
}
