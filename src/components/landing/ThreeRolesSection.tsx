"use client";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";
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
      <section className="bg-[#fbfdf9] py-20 font-hero">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="mx-auto h-9 w-64 rounded-full bg-[#edf5ef] animate-pulse" />
            <div className="mx-auto mt-5 h-14 w-[34rem] max-w-full rounded-xl bg-[#edf5ef] animate-pulse" />
            <div className="mx-auto mt-5 h-5 w-96 max-w-full rounded bg-[#edf5ef] animate-pulse" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => {
              const isCorporateSkeleton = i === 2;

              return (
                <div
                  key={i}
                  className={`min-h-[440px] rounded-lg border p-6 animate-pulse ${
                    isCorporateSkeleton
                      ? "border-[#0f3d2e] bg-[#0f3d2e]"
                      : "border-[#dfe8e2] bg-white"
                  }`}
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="space-y-3">
                      <div
                        className={`h-3 w-8 rounded ${
                          isCorporateSkeleton ? "bg-[#3b3d39]" : "bg-[#edf5ef]"
                        }`}
                      />
                      <div
                        className={`h-7 w-40 rounded ${
                          isCorporateSkeleton ? "bg-[#3b3d39]" : "bg-[#edf5ef]"
                        }`}
                      />
                    </div>
                    <div
                      className={`h-14 w-14 rounded-full ${
                        isCorporateSkeleton ? "bg-[#3b3d39]" : "bg-[#edf5ef]"
                      }`}
                    />
                  </div>
                  <div
                    className={`mb-8 h-12 rounded ${
                      isCorporateSkeleton ? "bg-[#3b3d39]" : "bg-[#edf5ef]"
                    }`}
                  />
                  <div className="space-y-4">
                    {[0, 1, 2].map((b) => (
                      <div
                        key={b}
                        className={`h-4 w-3/4 rounded ${
                          isCorporateSkeleton ? "bg-[#3b3d39]" : "bg-[#edf5ef]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  const headline = data
    ? language === "en"
      ? data.headlineEn
      : data.headlineId
    : t(fallback.headlineId, fallback.headlineEn);

  const subtitle = data
    ? language === "en"
      ? data.subtitleEn
      : data.subtitleId
    : t(fallback.subtitleId, fallback.subtitleEn);

  const cards = (data?.cards ?? fallback.cards)
    .slice()
    .sort((a, b) => a.order - b.order);

  return (
    <section className="relative overflow-hidden bg-[#fbfdf9] py-20 font-hero text-[#0f3d2e]">
      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-hero text-4xl font-bold leading-tight tracking-tight text-[#0f3d2e] md:text-5xl">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-hero text-lg font-normal leading-8 text-[#4A5568]">
            {subtitle}
          </p>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {cards.map((card, i) => {
            const title = language === "en" ? card.titleEn : card.titleId;
            const isCorporate = card.key === "perusahaan";
            const bullets =
              language === "en"
                ? [card.bullet1En, card.bullet2En, card.bullet3En]
                : [card.bullet1Id, card.bullet2Id, card.bullet3Id];
            const ctaRaw = language === "en" ? card.ctaEn : card.ctaId;
            const cta = ctaRaw === "Daftar sebagai Mitra" ? "Daftar Mitra" : ctaRaw;
            const isExternal = card.href.startsWith("http");

            return (
              <ScrollReveal
                key={card.key}
                delay={i * 120}
                className="h-full"
                as="article"
              >
                <div
                  className={`group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-lg border p-6 transition-[border-color,transform] duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-1 ${
                    isCorporate
                      ? "border-[#0f3d2e] bg-[#0f3d2e] shadow-[0_28px_72px_-48px_rgba(15,61,46,0.9)]"
                      : "border-[#dfe8e2] bg-white shadow-[0_18px_44px_-36px_rgba(16,24,18,0.48)] hover:border-[#c8d5cc]"
                  }`}
                >
                  {isCorporate && (
                    <div className="absolute right-5 top-5 z-10 rounded-full bg-[#d8f4ea] px-4 py-1.5 text-sm font-bold text-[#0f3d2e]">
                      {t("Paket CSR", "CSR Plan")}
                    </div>
                  )}

                  <div className="mb-6 flex items-start justify-between gap-4 pt-5">
                    <div className="min-w-0">
                      <p
                        className={`mb-3 text-xs font-bold ${
                          isCorporate ? "text-[#d8f4ea]" : "text-[#4A5568]"
                        }`}
                      >
                        0{i + 1}
                      </p>
                      <h3
                        className={`font-hero text-2xl font-semibold tracking-normal ${
                          isCorporate ? "text-white" : "text-[#0F2C22]"
                        }`}
                      >
                        {title}
                      </h3>
                    </div>

                    <div
                      className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border ${
                        isCorporate
                          ? "border-white/30 bg-white"
                          : "border-[#dfe8e2] bg-[#f7fbf7]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <p
                    className={`mb-7 min-h-[52px] text-sm font-normal leading-6 ${
                      isCorporate ? "text-[#c9e9dd]" : "text-[#4A5568]"
                    }`}
                  >
                    {isCorporate
                      ? t(
                          "Untuk perusahaan yang butuh kontribusi ESG, CSR, dan kepatuhan karbon yang bisa diaudit.",
                          "For companies that need auditable ESG, CSR, and carbon-compliance contributions."
                        )
                      : t(
                          "Masuk ke ekosistem ID-MAP sesuai peran dan kebutuhan kontribusi Anda.",
                          "Join the ID-MAP ecosystem through the role that matches your contribution needs."
                        )}
                  </p>

                  {isCorporate && (
                    <div className="mb-6 grid grid-cols-3 gap-2 border-y border-white/20 py-4">
                      {["ESG", "CSR", "SRN"].map((item) => (
                        <span
                          key={item}
                          className="rounded-md bg-white/10 px-2 py-2 text-center text-xs font-bold text-[#d8f4ea]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <ul className="flex-1 space-y-3">
                    {bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className={`flex items-start gap-3 text-sm font-normal leading-6 ${
                          isCorporate ? "text-[#d8f4ea]" : "text-[#4A5568]"
                        }`}
                      >
                        <CheckCircle2
                          className={`mt-1 h-4 w-4 flex-shrink-0 ${
                            isCorporate ? "text-[#9fe1cb]" : "text-[#22c79a]"
                          }`}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={card.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border px-5 text-sm font-medium transition-colors ${
                      isCorporate
                        ? "border-white bg-white text-[#0f3d2e] hover:bg-[#e8f5ef]"
                        : "border-[#0f3d2e] bg-[#0f3d2e] text-white hover:border-[#0b5d43] hover:bg-[#0b5d43]"
                    }`}
                  >
                    {isCorporate && <Sparkles className="h-4 w-4" />}
                    {cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={360} className="mt-8">
          <div className="rounded-lg border border-[#dfe8e2] bg-white/75 px-5 py-4 text-center text-sm font-medium leading-6 text-[#69756e]">
            {t(
              "Akun perusahaan tetap menjadi jalur utama untuk pembelian kontribusi karbon, portofolio ESG, dan dokumen audit.",
              "Corporate accounts remain the primary path for carbon contribution purchases, ESG portfolios, and audit documents."
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
