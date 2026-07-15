"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";
import {
  TreePine,
  Sprout,
  BarChart3,
  Fish,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "@/contexts/LanguageContext";
import TiltCard from "@/components/shared/TiltCard";
import ScrollReveal from "@/components/shared/ScrollReveal";

const services = [
  {
    key: "rehabilitasi-mangrove",
    iconName: "TreePine",
    icon: TreePine,
    title: ["Rehabilitasi Mangrove", "Mangrove Rehabilitation"],
    desc: [
      "Penanaman dan pemulihan kawasan mangrove terdegradasi dengan pendekatan berbasis ekosistem dan partisipasi masyarakat lokal.",
      "Planting and restoring degraded mangrove areas using ecosystem-based approaches with local community participation.",
    ],
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
    values: [
      ["600.000 ha", "Target PMN Nasional"],
      ["47,8%", "Realisasi s/d 2024"],
      ["9 Provinsi", "Prioritas Restorasi"],
    ],
    iconBg: "bg-emerald-700",
    badge: "bg-emerald-600",
    badgeText: "Ekosistem",
    accentFrom: "from-emerald-950/95",
    accentVia: "via-emerald-900/80",
  },
  {
    key: "penyulaman-mangrove",
    iconName: "Sprout",
    icon: Sprout,
    title: ["Penyulaman Mangrove", "Mangrove Replanting"],
    desc: [
      "Pengisian kembali tanaman yang mati atau rusak untuk memastikan kepadatan tegakan dan keberhasilan tumbuh jangka panjang.",
      "Refilling dead or damaged plants to ensure stand density and long-term growth success.",
    ],
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    values: [
      ["85%+", "Survival Rate Target"],
      ["120+ Spesies", "Mangrove Lokal"],
      ["Monitoring", "Rutin Berkala"],
    ],
    iconBg: "bg-teal-700",
    badge: "bg-teal-600",
    badgeText: "Revegetasi",
    accentFrom: "from-teal-950/95",
    accentVia: "via-teal-900/80",
  },
  {
    key: "monev-mangrove",
    iconName: "BarChart3",
    icon: BarChart3,
    title: ["Jasa Pemantauan Monev Mangrove", "Mangrove Monitoring & Evaluation"],
    desc: [
      "Pemantauan, evaluasi, dan pelaporan MRV berkala menggunakan teknologi penginderaan jauh dan survei lapangan terstandar.",
      "Periodic monitoring, evaluation, and MRV reporting using remote sensing technology and standardized field surveys.",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    values: [
      ["Citra 10m", "Resolusi Satelit"],
      ["MRV Ready", "SRN KLHK"],
      ["Laporan ESG", "Otomatis"],
    ],
    iconBg: "bg-blue-700",
    badge: "bg-blue-600",
    badgeText: "Teknologi",
    accentFrom: "from-blue-950/95",
    accentVia: "via-blue-900/80",
  },
  {
    key: "decarbonisasi-aquaculture",
    iconName: "Fish",
    icon: Fish,
    title: ["Decarbonisasi Aquaculture", "Aquaculture Decarbonization"],
    desc: [
      "Integrasi mangrove pada tambak budidaya untuk mereduksi emisi karbon dan meningkatkan produktivitas ekosistem pesisir secara berkelanjutan.",
      "Integrating mangroves into aquaculture ponds to reduce carbon emissions and sustainably enhance coastal ecosystem productivity.",
    ],
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=800&q=80",
    values: [
      ["185 tCO₂", "Serapan/ha/tahun"],
      ["Blue Carbon", "Credit Eligible"],
      ["USD 345 Juta", "Potensi/tahun"],
    ],
    iconBg: "bg-cyan-700",
    badge: "bg-cyan-600",
    badgeText: "Carbon Credit",
    accentFrom: "from-cyan-950/95",
    accentVia: "via-cyan-900/80",
  },
  {
    key: "habitat-penyu",
    iconName: "Shield",
    icon: Shield,
    title: ["Perbaikan Habitat Penyu", "Sea Turtle Habitat Restoration"],
    desc: [
      "Pemulihan kawasan pantai bersarang penyu melalui rehabilitasi vegetasi pesisir dan pengelolaan kawasan berbasis konservasi.",
      "Restoring sea turtle nesting beaches through coastal vegetation rehabilitation and conservation-based area management.",
    ],
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=800&q=80",
    values: [
      ["5 Spesies", "Penyu Dilindungi"],
      ["Patroli 24/7", "Pantai Bersarang"],
      ["Zero Poaching", "Target Program"],
    ],
    iconBg: "bg-orange-600",
    badge: "bg-orange-500",
    badgeText: "Konservasi",
    accentFrom: "from-orange-950/95",
    accentVia: "via-orange-900/80",
  },
  {
    key: "pemberdayaan-pesisir",
    iconName: "Users",
    icon: Users,
    title: ["Pemberdayaan Masyarakat Pesisir", "Coastal Community Empowerment"],
    desc: [
      "Penguatan kapasitas Pokmaswas dan masyarakat pesisir melalui pelatihan, pendampingan, dan sistem informasi pengawasan ekosistem mandiri.",
      "Strengthening Pokmaswas and coastal community capacity through training, mentoring, and independent ecosystem monitoring information systems.",
    ],
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    values: [
      ["500+ Kelompok", "Pokmaswas Aktif"],
      ["Bersertifikat", "Training Resmi"],
      ["Dashboard", "Pelaporan Digital"],
    ],
    iconBg: "bg-purple-700",
    badge: "bg-purple-600",
    badgeText: "Komunitas",
    accentFrom: "from-purple-950/95",
    accentVia: "via-purple-900/80",
  },
];

const iconMap = { TreePine, Sprout, BarChart3, Fish, Shield, Users };

// SVG timer ring constants
const TIMER_MS = 3500;
const R = 18;
const CIRC = 2 * Math.PI * R;

export default function OurServicesSection() {
  const { t } = useLanguage();
  const editableServices = useQuery(api.serviceContent.list);
  const isLoading = editableServices === undefined;
  const savedByKey = new Map((editableServices ?? []).map((svc) => [svc.key, svc]));

  const displayServices = services.map((svc) => {
    const saved = savedByKey.get(svc.key);
    if (!saved) return svc;
    return {
      ...svc,
      key: saved.key,
      iconName: saved.iconName,
      icon: iconMap[saved.iconName as keyof typeof iconMap] ?? svc.icon,
      title: [saved.titleId, saved.titleEn],
      desc: [saved.descriptionId, saved.descriptionEn],
      image: saved.image,
      values: [
        [saved.value1, saved.label1],
        [saved.value2, saved.label2],
        [saved.value3, saved.label3],
      ],
      iconBg: saved.iconBgClass,
      badge: saved.badgeClass,
      badgeText: saved.badgeText,
    };
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerPct, setTimerPct] = useState(0);
  const totalCards = displayServices.length;

  // Scroll carousel to active card
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoading) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const card = cards[activeIndex];
    if (card) {
      el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
  }, [activeIndex, isLoading]);

  // Auto-advance timer using rAF
  useEffect(() => {
    if (isLoading) return;
    setTimerPct(0);
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const pct = Math.min((now - start) / TIMER_MS, 1);
      setTimerPct(pct);
      if (pct < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setActiveIndex((prev) => (prev + 1) % totalCards);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeIndex, isLoading, totalCards]);

  const navigate = useCallback(
    (dir: "left" | "right") => {
      setActiveIndex((prev) =>
        dir === "right" ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
      );
    },
    [totalCards]
  );

  const goTo = useCallback((i: number) => setActiveIndex(i), []);

  const secondsLeft = Math.ceil((1 - timerPct) * (TIMER_MS / 1000));
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < totalCards - 1;

  return (
    <section className="bg-white py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* ── Header row ─────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <ScrollReveal>
            <h2 className="max-w-[10ch] text-[2rem] font-bold leading-[1.05] tracking-[-0.02em] text-[#0f3d2e] sm:max-w-none sm:text-[2rem]">
              {t("Solusi Ekosistem Pesisir", "Coastal Ecosystem Solutions")}
            </h2>
          </ScrollReveal>

          {/* Outline nav arrows */}
          <ScrollReveal delay={90} className="hidden flex-shrink-0 gap-3 pt-1 sm:flex">
            <button
              onClick={() => navigate("left")}
              aria-label="Sebelumnya"
              disabled={!canGoPrev}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 sm:h-[38px] sm:w-[38px] ${
                canGoPrev
                  ? "border-[#0f3d2e] bg-transparent text-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white"
                  : "cursor-not-allowed border-slate-300 text-slate-400 opacity-35"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("right")}
              aria-label="Berikutnya"
              disabled={!canGoNext}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 sm:h-[38px] sm:w-[38px] ${
                canGoNext
                  ? "border-[#0f3d2e] bg-transparent text-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white"
                  : "cursor-not-allowed border-slate-300 text-slate-400 opacity-35"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </ScrollReveal>
        </div>

        {/* ── Carousel track ──────────────────────────────────────── */}
        <ScrollReveal delay={140}>
          <div
            ref={scrollRef}
            className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[420px] w-[calc(100vw-2rem)] flex-shrink-0 rounded-xl bg-stone-300/60 animate-pulse sm:h-[420px] sm:w-[min(72vw,680px)] lg:w-[min(55vw,680px)]"
                  style={{
                    scrollSnapAlign: "start",
                  }}
                />
              ))
            : displayServices.map((svc, i) => {
                const isActive = i === activeIndex;
                const ServiceIcon = svc.icon;

                return (
                  <TiltCard
                    key={svc.key}
                    maxTilt={15}
                    liftZ={40}
                    glare={false}
                    className="w-[calc(100vw-2rem)] flex-shrink-0 rounded-xl sm:w-[min(72vw,690px)] lg:w-[min(48vw,710px)]"
                    style={
                      {
                        scrollSnapAlign: "start",
                      } as CSSProperties
                    }
                  >
                    {/* Card inner — click to jump to this card */}
                    <div
                      className="group relative h-[392px] cursor-pointer overflow-hidden rounded-xl bg-[#0f3d2e] shadow-[0_24px_60px_-30px_rgba(15,61,46,0.42)] sm:h-[392px]"
                      onClick={() => goTo(i)}
                    >
                      <div className="absolute inset-x-0 top-0 z-10 flex min-h-[60%] flex-col justify-start px-5 py-6 sm:inset-y-0 sm:left-0 sm:w-[52%] sm:px-8 md:px-10">
                        <div className="max-w-[32ch]">
                          <h3 className="max-w-[12ch] break-words text-[1.7rem] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:max-w-[13ch] sm:text-[2rem]">
                            {t(svc.title[0], svc.title[1])}
                          </h3>
                          <p className="mt-4 max-w-[27ch] text-[14px] font-normal leading-[1.65] text-[#c9e9dd] sm:mt-5 sm:max-w-[30ch] sm:text-[16px]">
                            {t(svc.desc[0], svc.desc[1])}
                          </p>

                          <div className="mt-5 inline-flex items-center rounded-full border border-[#5dcaa5]/35 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d9f5ea]">
                            Layanan inti
                          </div>

                          <div className="mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#9fe1cb]">
                            <ServiceIcon className="h-5 w-5" strokeWidth={2} />
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={svc.image}
                          alt={svc.title[0]}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(225,245,238,0.18),rgba(93,202,165,0.08))]" />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 top-[54%] overflow-hidden sm:hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={svc.image}
                          alt={svc.title[0]}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,61,46,0.04),rgba(15,61,46,0.18))]" />
                      </div>

                      {/* ── Timer ring (bottom-right, only active card) ── */}
                      {isActive && (
                        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#0f3d2e]/40 p-1 backdrop-blur-sm sm:bottom-4 sm:right-4">
                          <svg
                            width="42"
                            height="42"
                            viewBox="0 0 48 48"
                            className="-rotate-90"
                          >
                            {/* Track */}
                            <circle
                              cx="24"
                              cy="24"
                              r={R}
                              fill="none"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="3"
                            />
                            {/* Progress */}
                            <circle
                              cx="24"
                              cy="24"
                              r={R}
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeDasharray={CIRC}
                              strokeDashoffset={CIRC * (1 - timerPct)}
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Countdown number */}
                          <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold rotate-90 sm:text-[11px]">
                            {secondsLeft}s
                          </span>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                );
              })}
          </div>
        </ScrollReveal>

        {/* ── Dot indicators ──────────────────────────────────────── */}
        {!isLoading && (
          <ScrollReveal delay={220} className="mt-6 flex items-center justify-center gap-3 sm:hidden">
            <button
              onClick={() => navigate("left")}
              aria-label="Sebelumnya"
              disabled={!canGoPrev}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
                canGoPrev
                  ? "border-[#0f3d2e] bg-transparent text-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white"
                  : "cursor-not-allowed border-slate-300 text-slate-400 opacity-35"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-center gap-2">
              {displayServices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ke layanan ${i + 1}`}
                  className={`h-2 rounded-full border transition-all duration-300 ${
                    i === activeIndex
                      ? "w-[22px] border-[#5dcaa5] bg-[#5dcaa5]"
                      : "w-2 border-[#5dcaa5] bg-transparent hover:bg-[#e1f5ee]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate("right")}
              aria-label="Berikutnya"
              disabled={!canGoNext}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
                canGoNext
                  ? "border-[#0f3d2e] bg-transparent text-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white"
                  : "cursor-not-allowed border-slate-300 text-slate-400 opacity-35"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </ScrollReveal>
        )}

        {!isLoading && (
          <ScrollReveal delay={220} className="mt-8 hidden justify-center gap-2 sm:flex">
            {displayServices.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ke layanan ${i + 1}`}
                className={`h-2 rounded-full border transition-all duration-300 ${
                  i === activeIndex
                    ? "w-[22px] border-[#5dcaa5] bg-[#5dcaa5]"
                    : "w-2 border-[#5dcaa5] bg-transparent hover:bg-[#e1f5ee]"
                }`}
              />
            ))}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

