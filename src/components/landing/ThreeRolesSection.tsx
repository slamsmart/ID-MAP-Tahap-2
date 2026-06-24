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

const CARD_COLORS: Record<string, { bg: string; btn: string; shadow: string }> = {
  sahabat:    { bg: "#2d7d52", btn: "rgba(255,255,255,0.18)", shadow: "rgba(45,125,82,0.45)" },
  mitra:      { bg: "#2a5fa5", btn: "rgba(255,255,255,0.18)", shadow: "rgba(42,95,165,0.45)" },
  perusahaan: { bg: "#b87010", btn: "rgba(255,255,255,0.18)", shadow: "rgba(184,112,16,0.45)" },
};
const DEFAULT_COLOR = { bg: "#2d7d52", btn: "rgba(255,255,255,0.18)", shadow: "rgba(45,125,82,0.45)" };

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
      bullet1Id: "Kontribusi mudah via QRIS",
      bullet1En: "Easy contribution via QRIS",
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
                className="flex flex-col items-center rounded-3xl bg-gray-100 animate-pulse min-h-[400px] p-8"
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
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            {headline}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const title = language === "en" ? card.titleEn : card.titleId;
            const bullets =
              language === "en"
                ? [card.bullet1En, card.bullet2En, card.bullet3En]
                : [card.bullet1Id, card.bullet2Id, card.bullet3Id];
            const ctaRaw = language === "en" ? card.ctaEn : card.ctaId;
            const cta = ctaRaw === "Daftar sebagai Mitra" ? "Daftar Mitra" : ctaRaw;
            const isExternal = card.href.startsWith("http");
            const color = CARD_COLORS[card.key] ?? DEFAULT_COLOR;

            return (
              <ScrollReveal key={card.key} delay={i * 120} className="h-full">
                <TiltCard
                  maxTilt={9}
                  liftZ={28}
                  glare={false}
                  className="h-full rounded-3xl"
                >
                  <article
                    className="group relative flex flex-col items-center text-center rounded-3xl border border-white/10 min-h-[400px] p-8 pt-10"
                    style={{
                      backgroundColor: color.bg,
                      boxShadow: `0 28px 70px -22px ${color.shadow}`,
                    }}
                  >
                    {/* Circular logo */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg mb-5 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-white text-2xl tracking-tight leading-snug mb-6">
                      {title}
                    </h3>

                    {/* Bullets — left-aligned */}
                    <ul className="space-y-3 text-left w-full flex-1">
                      {bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-white/90 text-sm leading-snug"
                        >
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/70" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={card.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white border border-white/40 transition-all duration-200 hover:bg-white/20"
                      style={{ backgroundColor: color.btn }}
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
