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

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">

        {/* ── Header row ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-10 gap-6">
          <ScrollReveal>
            <h2 className="font-montserrat text-4xl font-extrabold tracking-tight text-[#0f3d2e] leading-tight">
              {t("Solusi Ekosistem Pesisir", "Coastal Ecosystem Solutions")}
            </h2>
          </ScrollReveal>

          {/* Green nav arrows — top right (matches reference) */}
          <div className="flex gap-3 flex-shrink-0 pt-1">
            <button
              onClick={() => navigate("left")}
              aria-label="Sebelumnya"
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all duration-200 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("right")}
              aria-label="Berikutnya"
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all duration-200 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Carousel track ──────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-2xl bg-stone-300/60 animate-pulse"
                  style={{
                    width: "clamp(300px, 55vw, 680px)",
                    height: 420,
                    scrollSnapAlign: "start",
                  }}
                />
              ))
            : displayServices.map((svc, i) => {
                const isActive = i === activeIndex;

                return (
                  <TiltCard
                    key={svc.key}
                    maxTilt={15}
                    liftZ={40}
                    glare={false}
                    className="flex-shrink-0 rounded-[24px]"
                    style={
                      {
                        width: "clamp(300px, 55vw, 680px)",
                        scrollSnapAlign: "start",
                      } as CSSProperties
                    }
                  >
                    {/* Card inner — click to jump to this card */}
                    <div
                      className="relative overflow-hidden rounded-[24px] border-[6px] border-[#f4efd8] bg-[#f4efd8] group cursor-pointer shadow-sm"
                      style={{ height: 420 }}
                      onClick={() => goTo(i)}
                    >
                      {/* ── Full-bleed background photo ── */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={svc.image}
                        alt={svc.title[0]}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* ── Solid panel — always solid, darker on hover ── */}
                      <div className="absolute inset-y-0 left-0 w-[50%] bg-[#587434] transition-all duration-500 ease-out group-hover:w-[52%] group-hover:bg-[#4a6029]" />

                      {/* ── Card content ── */}
                      <div className="absolute inset-y-0 left-0 flex w-[50%] flex-col justify-between p-7 md:p-9">
                        <div>
                          <h3 className="font-montserrat text-3xl md:text-4xl font-extrabold text-white leading-[0.95] transition-colors duration-300 group-hover:text-[#ffd84d]">
                            {t(svc.title[0], svc.title[1])}
                          </h3>
                        </div>
                        <div>
                          <p className="font-montserrat font-normal text-white text-base md:text-lg leading-snug">
                            {t(svc.desc[0], svc.desc[1])}
                          </p>
                        </div>
                      </div>

                      {/* ── Timer ring (bottom-right, only active card) ── */}
                      {isActive && (
                        <div className="absolute bottom-5 right-5 pointer-events-none">
                          <svg
                            width="48"
                            height="48"
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
                          <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold rotate-90">
                            {secondsLeft}s
                          </span>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                );
              })}
        </div>

        {/* ── Dot indicators ──────────────────────────────────────── */}
        {!isLoading && (
          <div className="flex gap-2 mt-6 justify-center">
            {displayServices.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ke layanan ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-8 bg-emerald-600"
                    : "w-2 bg-emerald-300 hover:bg-emerald-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
