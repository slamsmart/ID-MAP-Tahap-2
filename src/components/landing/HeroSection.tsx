"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getHeroImage } from "@/lib/heroImageStore";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_IMAGE = "/images/hero-mangrove.webp";

export default function HeroSection() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    getHeroImage().then((img) => {
      setHeroImage(img || DEFAULT_IMAGE);
    });
  }, []);

  return (
    <section
      className="relative overflow-hidden min-h-[580px] md:min-h-[680px] bg-cover bg-center transition-all duration-700"
      style={{
        backgroundImage: heroImage ? `linear-gradient(90deg, rgba(16, 64, 48, 0.85) 0%, rgba(16, 64, 48, 0.65) 40%, rgba(16, 64, 48, 0.2) 70%, rgba(16, 64, 48, 0) 100%), url('${heroImage}')` : 'none',
        backgroundColor: "#0f3d2e",
      }}
    >
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 md:pt-36 pb-32 md:pb-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-md text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            {t("Platform Infrastruktur Ekosistem Karbon", "Carbon Ecosystem Infrastructure Platform")}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm">
            {t("Satu Platform.", "One Platform.")}<br/>
            {t("Seluruh Ekosistem Mangrove", "The Entire Mangrove Ecosystem")}<br/>
            <span className="text-[#6ee7b7]">{t("Indonesia.", "Indonesia.")}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-white drop-shadow-sm font-medium">
            {t(
              "Data terintegrasi untuk pemantauan, rehabilitasi, dan keberlanjutan pesisir nusantara.",
              "Integrated data for monitoring, rehabilitation, and coastal sustainability of the archipelago."
            )}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
            <a href="/daftar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0f3d2e] hover:bg-gray-50 transition-colors">
              {t("Mulai Berkontribusi", "Start Contributing")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/jelajahi-peta-mangrove" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
              {t("Jelajahi Peta Mangrove", "Explore Mangrove Map")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
