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
      ctaId: "Daftar sebagai Mitra",
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

  // Loading state — render a skeleton while Convex hydrates so we don't
  // flash the hard-coded Unsplash fallback before swapping to the
  // verifikator-managed images. data === undefined means still loading;
  // data === null means no record yet (use fallback).
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
                className="grid grid-cols-[1.05fr_0.95fr] rounded-3xl overflow-hidden border border-gray-200 min-h-[420px] bg-white shadow-sm"
              >
                <div className="p-6 space-y-4 bg-gray-100">
                  <div className="h-7 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="space-y-2 mt-4">
                    {[0, 1, 2].map((b) => (
                      <div key={b} className="h-3.5 w-2/3 rounded bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                  <div className="h-9 w-32 rounded-full bg-gray-200 animate-pulse mt-6" />
                </div>
                <div className="bg-gray-100 animate-pulse" />
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
      {/* soft depth glow behind the cards */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            {headline}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6 perspective-1500">
          {cards.map((card, i) => {
            const title = language === "en" ? card.titleEn : card.titleId;
            const bullets =
              language === "en"
                ? [card.bullet1En, card.bullet2En, card.bullet3En]
                : [card.bullet1Id, card.bullet2Id, card.bullet3Id];
            const cta = language === "en" ? card.ctaEn : card.ctaId;
            const isExternal = card.href.startsWith("http");

            // Per-role tint (solid gradient panel kiri + accent CTA).
            const tint =
              card.key === "sahabat"
                ? {
                    panel:
                      "linear-gradient(135deg, #0d47a1 0%, #0288d1 70%, #29b6f6 100%)",
                    accent: "from-sky-500 to-blue-700",
                    bullet: "text-sky-100",
                    seam: "rgba(13,71,161,0.55)",
                  }
                : card.key === "mitra"
                ? {
                    panel:
                      "linear-gradient(135deg, #0f3d2e 0%, #1f6f54 65%, #34d399 100%)",
                    accent: "from-emerald-500 to-emerald-700",
                    bullet: "text-emerald-100",
                    seam: "rgba(15,61,46,0.55)",
                  }
                : {
                    panel:
                      "linear-gradient(135deg, #0d5a50 0%, #149e86 60%, #eab308 100%)",
                    accent: "from-teal-500 to-amber-600",
                    bullet: "text-amber-50",
                    seam: "rgba(13,90,80,0.55)",
                  };

            return (
              <ScrollReveal key={card.key} delay={i * 120} className="h-full">
              <TiltCard
                maxTilt={9}
                liftZ={28}
                glare={false}
                className="h-full rounded-3xl"
              >
                <article className="group relative h-full grid grid-cols-[1.05fr_0.95fr] rounded-3xl overflow-hidden border border-white/10 shadow-[0_28px_70px_-22px_rgba(15,61,46,0.55)] hover:shadow-[0_38px_90px_-22px_rgba(15,61,46,0.7)] transition-shadow duration-300">
                  {/* Left: solid tint panel (no photo here) */}
                  <div
                    className="relative flex flex-col justify-between p-6 md:p-7 min-h-[420px]"
                    style={{ backgroundImage: tint.panel }}
                  >
                    {/* soft top-left vignette for extra depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/15 to-transparent" />

                    <div className="relative z-10">
                      <h3 className="font-extrabold text-white tracking-tight leading-[1.1] text-[28px] md:text-[34px]">
                        {title}
                      </h3>
                      <ul className="mt-5 space-y-2.5">
                        {bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className={`flex items-start gap-2 text-[13px] leading-snug ${tint.bullet}`}
                          >
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/85" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={card.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={`relative z-10 mt-6 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r ${tint.accent} px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:brightness-110 transition`}
                    >
                      {cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>

                  {/* Right: full-bleed photo (single image per card) */}
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    {/* feathered seam between text panel and photo */}
                    <div
                      className="absolute inset-y-0 left-0 w-16"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${tint.seam}, rgba(0,0,0,0))`,
                      }}
                    />
                  </div>
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
