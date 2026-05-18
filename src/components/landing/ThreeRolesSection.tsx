"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ThreeRolesSection() {
  const { t } = useLanguage();

  const sections = [
    {
      title: t("Komunitas", "Community"),
      bullets: [
        t("Kontribusi mudah via QRIS", "Easy contribution via QRIS"),
        t("Pantau dampak real-time", "Monitor impact in real-time"),
        t("Transparan dan terpercaya", "Transparent and trusted"),
      ],
      cta: t("Dukung Sekarang", "Support Now"),
      href: "/daftar?peran=komunitas",
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: t("Mitra Proyek", "Project Partners"),
      bullets: [
        t("Pendanaan proyek", "Project funding"),
        t("Pendampingan teknis", "Technical assistance"),
        t("MRV & Registrasi SRN", "MRV & SRN Registration"),
      ],
      cta: t("Daftar sebagai Mitra", "Register as Partner"),
      href: "/daftar?peran=mitra",
      image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=700&q=80",
    },
    {
      title: t("Perusahaan", "Corporates"),
      bullets: [
        t("Proyek terverifikasi & SRN ready", "Verified projects & SRN ready"),
        t("Laporan ESG otomatis", "Automated ESG reports"),
        t("Dukungan kepatuhan regulasi", "Regulatory compliance support"),
      ],
      cta: t("Lihat Solusi Corporate", "View Corporate Solutions"),
      href: "/daftar?peran=perusahaan",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80",
    },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            {t("Tiga Peran, Satu Ekosistem", "Three Roles, One Ecosystem")}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            {t(
              "ID-MAP menghubungkan tiga pihak untuk menciptakan dampak lingkungan dan nilai ekonomi.",
              "ID-MAP connects three parties to create environmental impact and economic value."
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="flex flex-col rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-[#0f3d2e]">
                  {section.title}
                </h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.image}
                  alt={section.title}
                  className="h-24 w-24 rounded-xl object-cover flex-shrink-0"
                />
              </div>

              <ul className="mt-5 space-y-3 flex-grow">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4">
                <a
                  href={section.href}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[#1f6f54] hover:bg-[#0f3d2e] transition-colors"
                >
                  {section.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
