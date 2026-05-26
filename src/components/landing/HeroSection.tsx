"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getHeroImage } from "@/lib/heroImageStore";
import { useLanguage } from "@/contexts/LanguageContext";

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

  // Legacy fallback: per-browser hero image saved in IndexedDB by the old
  // hero-image setter. Only used when Convex has no live record yet.
  useEffect(() => {
    getHeroImage().then((img) => setLegacyHeroImage(img || null));
  }, []);

  // Resolve a stat by Convex key, falling back to a hard-coded display value
  // so the hero never renders blank during the initial query hydrate. Once
  // Convex resolves, the live numbers take over without flicker.
  const statByKey = new Map((stats ?? []).map((s) => [s.key, s.value]));
  const sahabatStat = statByKey.get("sahabat_terlibat") ?? "—";
  const bibitStat = statByKey.get("bibit_ditanam") ?? "—";
  const carbonStat = statByKey.get("serapan_karbon") ?? "—";
  const valueStat = statByKey.get("potensi_nilai_carbon") ?? "—";

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

  return (
    <section
      className="relative overflow-hidden min-h-[580px] md:min-h-[680px] bg-cover bg-center transition-all duration-700"
      style={{
        backgroundImage: heroImage
          ? `linear-gradient(90deg, rgba(16, 64, 48, 0.85) 0%, rgba(16, 64, 48, 0.65) 40%, rgba(16, 64, 48, 0.2) 70%, rgba(16, 64, 48, 0) 100%), url('${heroImage}')`
          : "none",
        backgroundColor: "#0f3d2e",
      }}
    >
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 md:pt-36 pb-32 md:pb-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-md text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            {badge}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm">
            {line1}
            <br />
            {line2}
            <br />
            <span className="text-[#6ee7b7]">{accent}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-white drop-shadow-sm font-medium">
            {subhead}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
            <a
              href={data.primaryCtaHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0f3d2e] hover:bg-gray-50 transition-colors"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={data.secondaryCtaHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              {secondaryLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Stats — sourced from Convex platformStats so verifikator dashboard
              edits propagate live without redeploy. */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/20">
            <div className="sm:pr-8">
              <p className="text-2xl sm:text-3xl font-extrabold text-white whitespace-nowrap">{sahabatStat}</p>
              <p className="text-sm text-white/70 mt-0.5">{t("Sahabat Terlibat", "Partners Involved")}</p>
            </div>
            <div className="sm:px-8">
              <p className="text-2xl sm:text-3xl font-extrabold text-white whitespace-nowrap">{bibitStat}</p>
              <p className="text-sm text-white/70 mt-0.5">{t("Bibit Mangrove Ditanam", "Mangrove Seedlings Planted")}</p>
            </div>
            <div className="sm:px-8">
              <p className="text-2xl sm:text-3xl font-extrabold text-white whitespace-nowrap">{carbonStat} <span className="text-lg font-semibold">Ton</span></p>
              <p className="text-sm text-white/70 mt-0.5">{t("Serapan Karbon (CO₂e)", "Carbon Absorption (CO₂e)")}</p>
            </div>
            <div className="sm:pl-8">
              <p className="text-2xl sm:text-3xl font-extrabold text-white whitespace-nowrap">{valueStat}</p>
              <p className="text-sm text-white/70 mt-0.5">{t("Potensi Nilai Carbon", "Potential Carbon Value")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
