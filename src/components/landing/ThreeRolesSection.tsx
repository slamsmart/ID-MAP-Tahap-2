"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
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
                className="flex flex-col rounded-2xl border border-gray-200 p-6 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
                  <div className="h-24 w-24 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                </div>
                <ul className="mt-5 space-y-3 flex-grow">
                  {[0, 1, 2].map((b) => (
                    <li key={b} className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                  ))}
                </ul>
                <div className="mt-6 pt-4">
                  <div className="h-10 w-40 rounded-full bg-gray-100 animate-pulse" />
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
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            {headline}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 perspective-1500">
          {cards.map((card, i) => {
            const title = language === "en" ? card.titleEn : card.titleId;
            const bullets =
              language === "en"
                ? [card.bullet1En, card.bullet2En, card.bullet3En]
                : [card.bullet1Id, card.bullet2Id, card.bullet3Id];
            const cta = language === "en" ? card.ctaEn : card.ctaId;
            const isExternal = card.href.startsWith("http");

            return (
              <ScrollReveal key={card.key} delay={i * 120} className="h-full">
              <TiltCard
                maxTilt={9}
                liftZ={28}
                className="h-full rounded-2xl"
              >
                <article
                  className="group flex h-full flex-col rounded-2xl border border-emerald-100 p-6 bg-white shadow-[0_24px_60px_-24px_rgba(16,185,129,0.45)] hover:shadow-[0_36px_80px_-22px_rgba(16,185,129,0.6)] transition-shadow duration-300"
                >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-[#0f3d2e]">{title}</h3>
                  <div
                    className="relative h-24 w-24 flex-shrink-0 grid place-items-center transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.06]"
                    aria-hidden="true"
                  >
                    {/* Soft circular green glow that bleeds outside the disc */}
                    <span className="absolute inset-0 rounded-full bg-emerald-400/35 blur-2xl scale-110" />
                    <Image
                      src={card.image}
                      alt={title}
                      width={144}
                      height={144}
                      className="relative h-24 w-24 rounded-full object-cover ring-1 ring-emerald-100/50 shadow-[0_10px_28px_-6px_rgba(16,185,129,0.55)]"
                      loading="lazy"
                    />
                  </div>
                </div>

                <ul className="mt-5 space-y-3 flex-grow">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4">
                  <a
                    href={card.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[#1f6f54] hover:bg-[#0f3d2e] transition-colors"
                  >
                    {cta}
                    <ArrowRight className="h-4 w-4" />
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
