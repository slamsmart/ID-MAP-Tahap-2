"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

const EE_APP_URL =
  "https://ee-dimassyarifworkspace.projects.earthengine.app/view/mangrove-health-indeks-jatim";

export default function InteractiveMapSection() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleOpenMap = () => {
    router.push('/jelajahi-peta-mangrove');
  };

  return (
    <>
      {/* Always-visible MHI Section on Landing Page */}
      <section id="mhi-mangrove" className="py-16 sm:py-24 bg-gradient-to-b from-[#062d22] to-[#0a3f30] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">
                {t("Google Earth Engine", "Google Earth Engine")}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
              {t("Mangrove Health Index", "Mangrove Health Index")}
            </h2>
            <p className="text-emerald-200/80 text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              {t(
                "Pantau kondisi kesehatan ekosistem mangrove di Jawa Timur secara real-time menggunakan data satelit dan indeks vegetasi.",
                "Monitor the health of East Java's mangrove ecosystem in real-time using satellite data and vegetation indices."
              )}
            </p>
          </div>

          {/* Map Preview Card (Teaser) */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-black/40 bg-[#062d22]">
              {/* Preview iframe with extreme crop to hide all white UI, acting just as a beautiful map background teaser */}
              <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[450px] overflow-hidden bg-[#062d22]">
                <iframe
                  src={EE_APP_URL}
                  className="border-0 pointer-events-none max-w-none opacity-80"
                  style={{
                    width: 'calc(100% + 400px)',
                    height: 'calc(100% + 200px)',
                    marginLeft: '-300px',
                    marginTop: '-150px'
                  }}
                  allow="geolocation"
                  title="Mangrove Health Index - Jawa Timur (Preview)"
                  loading="lazy"
                />
                {/* Click overlay to navigate */}
                <div 
                  onClick={handleOpenMap}
                  className="absolute inset-0 bg-gradient-to-t from-[#062d22]/90 via-transparent to-[#062d22]/20 cursor-pointer group-hover:from-[#062d22]/70 transition-all duration-300 flex items-center justify-center"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 bg-[#0F2E2A]/90 backdrop-blur-md px-6 py-3 rounded-full border border-emerald-500/30 shadow-xl flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-bold tracking-wide">Jelajahi Peta Penuh</span>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-t from-[#062d22] to-transparent">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">
                    {t("Peta Interaktif MHI Jawa Timur", "Interactive MHI Map - East Java")}
                  </h3>
                  <p className="text-emerald-300/80 text-xs sm:text-sm mt-0.5">
                    {t("Klik untuk membuka peta layar penuh dengan fitur kalkulator", "Click to open fullscreen map with calculator feature")}
                  </p>
                </div>
                <button
                  onClick={handleOpenMap}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-800/50 group-hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("Buka Peta", "Open Map")}
                </button>
              </div>
            </div>

            {/* Info badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                { label: t("Data Satelit Real-time", "Real-time Satellite Data"), color: "emerald" },
                { label: t("NDVI Index", "NDVI Index"), color: "teal" },
                { label: t("Jawa Timur Coverage", "East Java Coverage"), color: "cyan" },
              ].map((badge, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium backdrop-blur-sm">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${badge.color}-400`} />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
