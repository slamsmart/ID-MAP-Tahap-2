"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, Leaf, Waves, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getHeroImage } from "@/lib/heroImageStore";
import { useLanguage } from "@/contexts/LanguageContext";
import TiltCard from "@/components/shared/TiltCard";

const DEFAULT_IMAGE = "/images/hero-mangrove.webp";

// Default copy used when no Convex landingHero record exists yet.
// Verifikator dashboard publishes a doc into convex; once present this
// component switches to the live values automatically.
const DEFAULTS = {
  badgeId: "Platform Integrasi Data Ekosistem Pesisir Berkelanjutan",
  badgeEn: "Integrated Coastal Ecosystem Data Platform for Sustainability",
  headlineLine1Id: "Satu Platform.",
  headlineLine1En: "One Platform.",
  headlineLine2Id: "Seluruh Ekosistem Mangrove & Pesisir",
  headlineLine2En: "The Entire Mangrove & Coastal Ecosystem",
  headlineAccentId: "Indonesia.",
  headlineAccentEn: "Indonesia.",
  subheadId:
    "Data terintegrasi untuk pemantauan restorasi lingkungan, rehabilitasi, dan keberlanjutan pesisir nusantara.",
  subheadEn:
    "Integrated data for environmental restoration monitoring, rehabilitation, and coastal sustainability of the archipelago.",
  primaryCtaLabelId: "Mulai Berkontribusi",
  primaryCtaLabelEn: "Start Contributing",
  primaryCtaHref: "/daftar",
  secondaryCtaLabelId: "Jelajahi Peta Restorasi Lingkungan",
  secondaryCtaLabelEn: "Explore Environmental Restoration Map",
  secondaryCtaHref: "/jelajahi-peta-mangrove",
  image: "" as string,
};

export default function HeroSection() {
  const liveHero = useQuery(api.landingHero.get);
  const stats = useQuery(api.platformStats.getAll);
  const [legacyHeroImage, setLegacyHeroImage] = useState<string | null>(null);
  const { language, t } = useLanguage();

  // Cursor-driven parallax: depth layers shift by different amounts to build
  // a sense of z-depth. Transforms are written straight to the DOM inside one
  // rAF frame — no React state, so moving the mouse never triggers a re-render.
  // The whole thing is gated behind a fine-pointer + motion-OK media query, so
  // phones/tablets and reduced-motion users get a static, cheap scene.
  const sceneRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // Legacy fallback: per-browser hero image saved in IndexedDB by the old
  // hero-image setter. Only used when Convex has no live record yet.
  useEffect(() => {
    getHeroImage().then((img) => setLegacyHeroImage(img || null));
  }, []);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const canParallax = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    if (!canParallax.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      if (bgRef.current)
        bgRef.current.style.transform = `translate3d(${x * -18}px, ${y * -18}px, 0) scale(1.12)`;
      if (orb1Ref.current)
        orb1Ref.current.style.transform = `translate3d(${x * 40}px, ${y * 40}px, 0)`;
      if (orb2Ref.current)
        orb2Ref.current.style.transform = `translate3d(${x * 60}px, ${y * 60}px, 0)`;
      if (copyRef.current)
        copyRef.current.style.transform = `translate3d(${x * 12}px, ${y * 12}px, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      x = (e.clientX - rect.left) / rect.width - 0.5;
      y = (e.clientY - rect.top) / rect.height - 0.5;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Resolve a stat by Convex key, falling back to seed-data numbers
  // so the hero always shows real numbers even when Convex is empty/loading.
  const statByKey = new Map((stats ?? []).map((s) => [s.key, s.value]));
  const sahabatStat = statByKey.get("sahabat_terlibat") ?? "12.456";
  const bibitStat = statByKey.get("bibit_ditanam") ?? "1.285.760";
  const carbonStat = statByKey.get("serapan_karbon") ?? "823.456";
  const valueStat = statByKey.get("potensi_nilai_carbon") ?? "Rp 98,65 M";

  const data = liveHero ?? DEFAULTS;
  const heroImage =
    (liveHero?.image && liveHero.image.length > 0
      ? liveHero.image
      : legacyHeroImage) || DEFAULT_IMAGE;

  const pick = (id: string, en: string) => (language === "en" ? en : id);

  const badge = pick(data.badgeId, data.badgeEn);
  const line1 = pick(data.headlineLine1Id, data.headlineLine1En);
  const line2 = pick(data.headlineLine2Id, data.headlineLine2En);
  const accent = pick(data.headlineAccentId, data.headlineAccentEn);
  const subhead = pick(data.subheadId, data.subheadEn);
  const primaryLabel = pick(data.primaryCtaLabelId, data.primaryCtaLabelEn);
  const secondaryLabel = pick(
    data.secondaryCtaLabelId,
    data.secondaryCtaLabelEn
  );

  const statCards = [
    { icon: Leaf, value: sahabatStat, label: t("Sahabat Terlibat", "Partners Involved") },
    { icon: Waves, value: bibitStat, label: t("Bibit Mangrove Ditanam", "Mangrove Seedlings Planted") },
    { icon: ShieldCheck, value: `${carbonStat} Ton`, label: t("Serapan Karbon (CO₂e)", "Carbon Absorption (CO₂e)") },
    { icon: TrendingUp, value: valueStat, label: t("Potensi Nilai Carbon", "Potential Carbon Value") },
  ];

  const impactStatCards = [
    {
      icon: statCards[0].icon,
      value: sahabatStat,
      suffix: t("Orang", "People"),
      label: t("Sahabat terlibat", "Partners involved"),
    },
    {
      icon: statCards[1].icon,
      value: bibitStat,
      suffix: t("Pohon", "Trees"),
      label: t("Bibit mangrove ditanam", "Mangrove seedlings planted"),
    },
    {
      icon: statCards[2].icon,
      value: carbonStat,
      suffix: "Ton CO2e",
      label: t("Serapan karbon terukur", "Measured carbon absorption"),
    },
    {
      icon: statCards[3].icon,
      value: valueStat,
      suffix: "",
      label: t("Potensi nilai karbon", "Carbon value potential"),
    },
  ];

  return (
    <section
      ref={sceneRef}
      className="relative overflow-hidden bg-[#06140f] perspective-1500"
    >
      {/* ===== Depth background layers (parallax) ===== */}
      {/* Deep base image, pushed furthest back */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center scale-[1.12] transition-transform duration-300 ease-out"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      {/* Tonal wash to sink the image into a dark, glowing scene */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#06140f]/95 via-[#0b2e22]/85 to-[#06140f]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06140f] via-transparent to-[#06140f]/40" />

      {/* Floating glow orbs — desktop only (blur-3xl is costly to composite on
          mobile GPUs). Hidden below md so phones stay light. */}
      <div
        ref={orb1Ref}
        className="hidden md:block absolute -top-24 -left-16 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl md:animate-glow-pulse will-change-transform"
      />
      <div
        ref={orb2Ref}
        className="hidden md:block absolute top-1/3 right-0 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl md:animate-glow-pulse will-change-transform"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Subtle grid floor for spatial depth — desktop only */}
      <div
        className="hidden md:block absolute inset-x-0 bottom-0 h-1/2 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(110,231,183,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          transform: "perspective(600px) rotateX(60deg)",
          transformOrigin: "bottom",
        }}
      />

      {/* ===== Content ===== */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-28 md:pt-36 pb-24 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: copy, lifted toward viewer */}
          <div
            ref={copyRef}
            className="lg:col-span-7 animate-rise-fade transition-transform duration-300 ease-out"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-white md:backdrop-blur-md text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" />
              {badge}
            </div>

            <h1 className="font-hero text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight text-white">
              <span className="drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">{line1}</span>
              <br />
              <span className="drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">{line2}</span>
              <br />
              <span className="text-white">{accent}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-emerald-50/90 font-normal">
              {subhead}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
              <a
                href={data.primaryCtaHref}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-100 px-6 py-3.5 text-sm font-bold text-black shadow-[0_12px_30px_-8px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_40px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-[#06140f]"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={data.secondaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors md:backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                {secondaryLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: floating 3D tilt image frame */}
          <div className="lg:col-span-5">
            <TiltCard
              maxTilt={12}
              liftZ={30}
              className="md:animate-float-tilt rounded-3xl"
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                <div
                  className="aspect-[4/5] bg-cover bg-center"
                  style={{ backgroundImage: `url('${heroImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06140f]/70 via-transparent to-transparent" />
                {/* floating mini-badge on the frame */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 md:backdrop-blur-md">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400/90 text-[#06140f]">
                    <Leaf className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-semibold text-white leading-tight">
                    {t("Pemantauan restorasi real-time", "Real-time restoration monitoring")}
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* ===== Live impact stats ===== */}
        <div
          className="mt-14"
          aria-label={t("Statistik dampak ID-MAP", "ID-MAP impact statistics")}
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 md:gap-x-10 lg:gap-x-14">
            {impactStatCards.map((stat) => {
              return (
                <div key={stat.label} className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                    <span className="break-words text-2xl font-extrabold leading-none text-white sm:text-3xl lg:text-[2rem]">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm font-bold leading-none text-white sm:text-base">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-snug text-emerald-50/70 sm:text-base">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
