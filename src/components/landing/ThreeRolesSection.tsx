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
                className="flex items-stretch gap-5 rounded-3xl overflow-hidden border border-gray-200 min-h-[340px] bg-white p-6 shadow-sm"
              >
                <div className="w-[40%] flex-shrink-0 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="flex flex-col justify-center flex-1 space-y-4">
                  <div className="h-7 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    {[0, 1, 2].map((b) => (
                      <div key={b} className="h-3.5 w-2/3 rounded bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                  <div className="h-9 w-32 rounded-full bg-gray-200 animate-pulse mt-2" />
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
            const ctaRaw = language === "en" ? card.ctaEn : card.ctaId;
            // Normalize legacy DB label "Daftar sebagai Mitra" -> "Daftar Mitra"
            const cta =
              ctaRaw === "Daftar sebagai Mitra" ? "Daftar Mitra" : ctaRaw;
            const isExternal = card.href.startsWith("http");

            return (
              <ScrollReveal key={card.key} delay={i * 120} className="h-full">
              <TiltCard
                maxTilt={9}
                liftZ={28}
                glare={false}
                className="h-full rounded-3xl"
              >
                {/* Uniform dark-green card: uploadable image (left) + copy (right). */}
                <article className="group relative h-full flex items-stretch gap-5 sm:gap-6 rounded-3xl overflow-hidden bg-[#0f3d2e] p-6 sm:p-7 border border-white/10 shadow-[0_28px_70px_-22px_rgba(15,61,46,0.55)] hover:shadow-[0_38px_90px_-22px_rgba(15,61,46,0.7)] transition-shadow duration-300 min-h-[340px]">
                  {/* Left: uploadable image/icon slot (admin swaps card.image) */}
                  <div className="relative w-[40%] flex-shrink-0 rounded-2xl overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>

                  {/* Right: copy */}
                  <div className="relative flex flex-col justify-center flex-1 py-1 pr-1">
                    <h3 className="font-extrabold text-white tracking-tight leading-[1.15] text-xl sm:text-[22px]">
                      {title}
                    </h3>
                    <ul className="mt-4 space-y-2.5">
                      {bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-sm sm:text-[15px] leading-snug text-emerald-100/85"
                        >
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-lime-400" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={card.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="mt-6 inline-flex items-center justify-center gap-2 self-start whitespace-nowrap rounded-full bg-lime-400 hover:bg-lime-300 px-6 py-3 text-[15px] font-bold text-black shadow-lg shadow-black/20 transition-colors"
                    >
                      {cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
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
