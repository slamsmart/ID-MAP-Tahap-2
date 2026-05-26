"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
      image:
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=700&q=80",
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
      image:
        "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=700&q=80",
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
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80",
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
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0f3d2e]">
            {headline}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const title = language === "en" ? card.titleEn : card.titleId;
            const bullets =
              language === "en"
                ? [card.bullet1En, card.bullet2En, card.bullet3En]
                : [card.bullet1Id, card.bullet2Id, card.bullet3Id];
            const cta = language === "en" ? card.ctaEn : card.ctaId;
            const isExternal = card.href.startsWith("http");

            return (
              <article
                key={card.key}
                className="flex flex-col rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-[#0f3d2e]">{title}</h3>
                  <Image
                    src={card.image}
                    alt={title}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                  />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
