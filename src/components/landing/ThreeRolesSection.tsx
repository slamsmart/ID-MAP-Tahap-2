"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";
import TiltCard from "@/components/shared/TiltCard";
import ScrollReveal from "@/components/shared/ScrollReveal";

type CardData = {
  key: string;
  titleId: string;
  titleEn: string;
  bullet1Id: string;
  bullet1En: string;
  bullet2Id: string;
  bullet2En: string;
  bullet3Id: string;
  bullet3En: string;
  ctaId: string;
  ctaEn: string;
  href: string;
  image: string;
  order: number;
};

const fallback = {
  headlineId: "Tiga Peran, Satu Ekosistem",
  headlineEn: "Three Roles, One Ecosystem",
  subtitleId:
    "ID-MAP menghubungkan tiga pihak untuk menciptakan dampak lingkungan dan nilai ekonomi.",
  subtitleEn:
    "ID-MAP connects three parties to create environmental impact and economic value.",
  cards: [
    {
      key: "sahabat",
      titleId: "Sahabat Pesisir",
      titleEn: "Sahabat Pesisir",
      bullet1Id: "Dukungan via QRIS untuk Kelompok Masyarakat Pesisir dan Perikanan",
      bullet1En: "QRIS support for Coastal and Fisheries Community Groups",
      bullet2Id: "Pantau dampak real-time",
      bullet2En: "Monitor impact in real-time",
      bullet3Id: "Transparan dan terpercaya",
      bullet3En: "Transparent and trusted",
      ctaId: "Dukung Sekarang",
      ctaEn: "Support Now",
      href: "/daftar?peran=sahabat",
      image: "/images/roles/sahabat.webp",
      order: 1,
    },
    {
      key: "mitra",
      titleId: "Mitra Proyek",
      titleEn: "Project Partners",
      bullet1Id: "Pendanaan proyek",
      bullet1En: "Project funding",
      bullet2Id: "Pendampingan teknis",
      bullet2En: "Technical assistance",
      bullet3Id: "MRV & Registrasi SRN",
      bullet3En: "MRV & SRN Registration",
      ctaId: "Daftar Mitra",
      ctaEn: "Register as Partner",
      href: "/daftar?peran=mitra",
      image: "/images/roles/mitra.webp",
      order: 2,
    },
    {
      key: "perusahaan",
      titleId: "Perusahaan",
      titleEn: "Corporates",
      bullet1Id: "Proyek terverifikasi & SRN ready",
      bullet1En: "Verified projects & SRN ready",
      bullet2Id: "Laporan ESG otomatis",
      bullet2En: "Automated ESG reports",
      bullet3Id: "Dukungan kepatuhan regulasi",
      bullet3En: "Regulatory compliance support",
      ctaId: "Hubungi Kami",
      ctaEn: "Contact Us",
      href: "https://wa.me/6281234561017",
      image: "/images/roles/perusahaan.webp",
      order: 3,
    },
  ] as CardData[],
};

export default function ThreeRolesSection() {
  const { language, t } = useLanguage();
  const data = useQuery(api.rolesSection.get);

  if (data === undefined) {
    return (
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10">
            <div className="h-9 w-80 max-w-full mx-auto rounded-md bg-gray-100 animate-pulse" />
            <div className="mt-3 h-4 w-96 max-w-full mx-auto rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl bg-gray-100 animate-pulse min-h-[400px] p-8"
              >
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-5" />
                <div className="h-7 w-1/2 rounded bg-gray-200 mb-6" />
                <div className="space-y-3 w-full">
                  {[0, 1, 2].map((b) => (
                    <div key={b} className="h-3.5 w-3/4 rounded bg-gray-200" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const headline = data
    ? language === "en" ? data.headlineEn : data.headlineId
    : t(fallback.headlineId, fallback.headlineEn);

  const subtitle = data
    ? language === "en" ? data.subtitleEn : data.subtitleId
    : t(fallback.subtitleId, fallback.subtitleEn);

  const cards = (data?.cards ?? fallback.cards)
    .slice()
    .sort((a, b) => a.order - b.order);

  return (
    <section className="relative py-16 bg-gradient-to-b from-white via-emerald-50/40 to-white overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-4xl font-semibold tracking-tight text-[#0f3d2e]">
            {headline}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const title = language === "en" ? card.titleEn : card.titleId;
            const isPrimeCorporate = card.key === "perusahaan";
            const bullets =
              language === "en"
                ? [card.bullet1En, card.bullet2En, card.bullet3En]
                : [card.bullet1Id, card.bullet2Id, card.bullet3Id];
            const ctaRaw = language === "en" ? card.ctaEn : card.ctaId;
            const cta = ctaRaw === "Daftar sebagai Mitra" ? "Daftar Mitra" : ctaRaw;
            const isExternal = card.href.startsWith("http");

            return (
              <ScrollReveal key={card.key} delay={i * 120} className="h-full">
                <TiltCard
                  maxTilt={9}
                  liftZ={28}
                  glare={false}
                  className="h-full rounded-2xl"
                >
                  <article
                    className={`group relative flex h-full min-h-[460px] flex-col items-center rounded-2xl border p-8 pt-10 text-center transition-all duration-300 ${
                      isPrimeCorporate
                        ? "border-[#0f3d2e] bg-[#0f3d2e] shadow-[0_30px_80px_-24px_rgba(15,61,46,0.68)]"
                        : "border-slate-200/80 bg-white shadow-[0_22px_55px_-34px_rgba(15,23,42,0.45)]"
                    }`}
                  >
                    {isPrimeCorporate && (
                      <span className="absolute right-5 top-5 rounded-full bg-[#e1f5ee] px-4 py-1.5 text-xs font-semibold text-[#04342c] shadow-sm">
                        Paket CSR
                      </span>
                    )}
                    {/* Circular logo */}
                    <div
                      className={`mb-5 h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 ${
                        isPrimeCorporate
                          ? "border-white/30 bg-white/10"
                          : "border-[#e1f5ee] bg-[#e1f5ee]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className={`mb-6 text-3xl font-semibold leading-snug tracking-tight transition-colors duration-300 ${
                        isPrimeCorporate
                          ? "text-white group-hover:text-lime-300"
                          : "text-[#0f3d2e] group-hover:text-[#0b5d43]"
                      }`}
                    >
                      {title}
                    </h3>

                    {/* Bullets — left-aligned */}
                    <ul className="space-y-3 text-left w-full flex-1">
                      {bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className={`flex items-start gap-3 text-base leading-snug ${
                            isPrimeCorporate ? "text-[#c9e9dd]" : "text-slate-600"
                          }`}
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                              isPrimeCorporate ? "text-[#9fe1cb]" : "text-[#5dcaa5]"
                            }`}
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={card.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors ${
                        isPrimeCorporate
                          ? "border-white bg-white text-[#0f3d2e] hover:bg-[#e1f5ee]"
                          : "border-[#0f3d2e] bg-[#0f3d2e] text-white hover:border-[#0b5d43] hover:bg-[#0b5d43]"
                      }`}
                    >
                      {cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </article>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

