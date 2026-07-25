"use client";

import {
  ChevronLeft, ChevronRight, Calculator, PenTool, Layers, Info,
  Loader2, Car, Plane, Home, Globe, Waves, Map, ShieldAlert, Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { INA_RISK_LEGEND } from "@/components/map/inaRiskLegend";
import { RTRW_LEGEND } from "@/components/map/rtrwLegend";
import { PRIORITAS_CONFIG, type PrioritasType } from "@/lib/abrasionData";

const ABRASION_LEGEND: { key: PrioritasType; label: string; color: string; desc: string }[] = [
  { key: "Tinggi", label: "Prioritas Tinggi", color: PRIORITAS_CONFIG["Tinggi"].dot, desc: "Abrasi berat, butuh intervensi segera" },
  { key: "Sedang", label: "Prioritas Sedang", color: PRIORITAS_CONFIG["Sedang"].dot, desc: "Abrasi sedang, pantau & rehabilitasi" },
  { key: "Rendah–Sedang", label: "Prioritas Rendah–Sedang", color: PRIORITAS_CONFIG["Rendah–Sedang"].dot, desc: "Risiko abrasi lebih rendah" },
];

const NativeMap = dynamic(() => import("@/components/map/NativeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-transparent animate-rise-fade">
      <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
      <p className="text-[11px] font-medium text-emerald-100/70 text-rise">Mengukur area…</p>
    </div>
  ),
});

const SharedInteractiveMap = dynamic(
  () => import("@/components/map/SharedInteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0F2E2A] animate-rise-fade">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-rise">
          <Loader2 className="h-6 w-6 text-emerald-300 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-emerald-50/90 text-rise" style={{ animationDelay: "90ms" }}>
          Memuat peta interaktif…
        </p>
        <p className="text-[11px] text-emerald-100/50 text-rise" style={{ animationDelay: "160ms" }}>
          Satellite · MHI · RTRW · PRL
        </p>
      </div>
    ),
  }
);

const MhiOverlay = dynamic(() => import("@/components/map/MhiOverlay"), { ssr: false });
const PrlOverlay = dynamic(() => import("@/components/map/PrlOverlay"), { ssr: false });
const RtrwOverlay = dynamic(() => import("@/components/map/RtrwOverlay"), { ssr: false });
const AbrasionOverlay = dynamic(() => import("@/components/map/AbrasionOverlay"), { ssr: false });
const TurtleOverlay = dynamic(() => import("@/components/map/TurtleOverlay"), { ssr: false });
const PokmaswasOverlay = dynamic(() => import("@/components/map/PokmaswasOverlay"), { ssr: false });
const InaRiskOverlay = dynamic(() => import("@/components/map/InaRiskOverlay"), { ssr: false });
const ScoringPanel = dynamic(() => import("@/components/map/ScoringPanel"), { ssr: false });

const MHI_LEGEND = [
  { color: "#1a9641", label: "Excellent", range: "> 66.6", desc: "Mangrove sangat sehat, kerapatan tinggi" },
  { color: "#f5c542", label: "Moderate", range: "33.3 - 66.6", desc: "Kondisi sedang, perlu pemantauan" },
  { color: "#d7191c", label: "Poor", range: "< 33.3", desc: "Kondisi kritis, butuh rehabilitasi" },
];

/** Sumber data: ground check vs satelit (GMW) — legenda penjelasan, bukan layer toggle. */
const DATA_SOURCE_LEGEND = [
  {
    key: "ground",
    label: "Digitasi ground check",
    badge: "Lapangan",
    badgeClass: "bg-emerald-100 text-emerald-800",
    color: "#059669",
    desc: "Data ID-MAP dari verifikasi lapangan & digitasi manual (titik/poligon). Contoh: MHI Jatim, abrasi, penyu, mitra/Pokmaswas.",
  },
  {
    key: "satellite",
    label: "Citra satelit (GMW)",
    badge: "Satelit",
    badgeClass: "bg-sky-100 text-sky-800",
    color: "#0284c7",
    desc: "Global Mangrove Watch (v3/v4) dari penginderaan jauh — cakupan global, resolusi ~25–30 m. Bukan pengganti ground check.",
  },
] as const;

export default function JelajahiPetaMangrovePage() {
  const [areaHa, setAreaHa] = useState<number>(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mhiCategory, setMhiCategory] = useState<"excellent" | "moderate" | "poor">("excellent");
  const [isAbrasionOpen, setIsAbrasionOpen] = useState(false);
  const [isTurtleLayerOpen, setIsTurtleLayerOpen] = useState(false);
  const [isPokmaswasLayerOpen, setIsPokmaswasLayerOpen] = useState(false);
  const [isPrlLayerOpen, setIsPrlLayerOpen] = useState(false);
  const [isRtrwDaratOpen, setIsRtrwDaratOpen] = useState(false);
  const [isInaRiskOpen, setIsInaRiskOpen] = useState(false);
  const [isMhiKmlOpen, setIsMhiKmlOpen] = useState(false);
  const [isScoringOpen, setIsScoringOpen] = useState(false);

  type LayerKey = "mhi" | "prl" | "rtrw" | "abrasion" | "turtle" | "pokmaswas" | "inarisk";

  const activeLayers = [
    isMhiKmlOpen && "MHI",
    isPrlLayerOpen && "PRL",
    isRtrwDaratOpen && "RTRW",
    isAbrasionOpen && "Abrasi",
    isTurtleLayerOpen && "Penyu",
    isPokmaswasLayerOpen && "Mitra",
    isInaRiskOpen && "BNPB",
  ].filter(Boolean) as string[];

  const anyLayerActive = activeLayers.length > 0;

  const toggleLayer = (key: LayerKey) => {
    if (key === "mhi") setIsMhiKmlOpen((v) => !v);
    else if (key === "prl") setIsPrlLayerOpen((v) => !v);
    else if (key === "rtrw") setIsRtrwDaratOpen((v) => !v);
    else if (key === "abrasion") setIsAbrasionOpen((v) => !v);
    else if (key === "turtle") setIsTurtleLayerOpen((v) => !v);
    else if (key === "pokmaswas") setIsPokmaswasLayerOpen((v) => !v);
    else if (key === "inarisk") setIsInaRiskOpen((v) => !v);
  };

  const setAllLayers = (on: boolean) => {
    setIsMhiKmlOpen(on);
    setIsPrlLayerOpen(on);
    setIsRtrwDaratOpen(on);
    setIsAbrasionOpen(on);
    setIsTurtleLayerOpen(on);
    setIsPokmaswasLayerOpen(on);
    setIsInaRiskOpen(on);
  };

  const [isMobile, setIsMobile] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<"none" | "legend" | "calculator">("none");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-collapse desktop panels saat berpindah ke mobile (mencegah panel desktop ketutup peta)
  useEffect(() => {
    if (isMobile) {
      setIsLegendOpen(false);
      setIsCalculatorOpen(false);
    } else {
      setIsLegendOpen(true);
      setIsCalculatorOpen(true);
      setMobileSheet("none");
    }
  }, [isMobile]);

  // Carbon calculation based on MHI category (IPCC + Murdiyarso et al., 2015)
  const carbonFactors = {
    excellent: { stock: 850, annual: 13.5, label: "Excellent (Hijau)", color: "#1a9641" },
    moderate: { stock: 475, annual: 8, label: "Moderate (Kuning)", color: "#f5c542" },
    poor: { stock: 180, annual: 3.5, label: "Poor (Merah)", color: "#d7191c" },
  };

  const factor = carbonFactors[mhiCategory];
  const totalCarbonStock = areaHa * factor.stock;
  const annualSequestration = areaHa * factor.annual;
  const motorEquivalent = Math.round(annualSequestration / 1);
  const flightEquivalent = Math.round(annualSequestration / 0.2);
  const homeEquivalent = Math.round(annualSequestration / 3);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F2E2A] flex flex-col font-sans animate-rise-fade">
      {/* ===== TOP NAVBAR ===== */}
      <header className="bg-[#0F2E2A] border-b border-[#235850] z-[600] relative shadow-lg shadow-black/20 text-rise">
        {/* Satu baris: branding | Polygon + Layer | Bantuan + Beranda */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 gap-2">
          {/* Left: Branding */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <Image
                src="/images/logo-white.png"
                alt="ID-MAP"
                fill
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white text-sm sm:text-lg tracking-wide flex items-center gap-1 sm:gap-2 truncate">
                PETA
                <span className="font-light text-white truncate">RESTORASI LINGKUNGAN</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-100/50 uppercase tracking-wider font-medium mt-0.5">
                <span>Powered by</span>
                <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <Globe className="w-2 h-2 text-blue-500" />
                </div>
                <span className="text-white/80">Google Earth Engine</span>
              </div>
            </div>
          </div>

          {/* Center + right actions — satu baris sejajar judul */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawing(!isDrawing)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs font-bold border ${
                isDrawing
                  ? "bg-emerald-500 text-white shadow-md border-emerald-400"
                  : "bg-[#062d22] text-white hover:bg-emerald-600 border-[#235850] hover:border-emerald-400"
              }`}
            >
              <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isDrawing ? "Menggambar..." : "Polygon"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScoringOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs font-bold border ${
                isScoringOpen
                  ? "bg-emerald-500 text-white shadow-md border-emerald-400"
                  : "bg-[#062d22] text-white hover:bg-amber-600 border-[#235850] hover:border-amber-400"
              }`}
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Skor</span>
            </button>

            <a
              href="mailto:id.map.admin@gmail.com?subject=Bantuan%20Peta%20Mangrove%20ID-MAP&body=Halo%20Tim%20ID-MAP%2C%0A%0ASaya%20butuh%20bantuan%20terkait%3A%20"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/40 bg-white/10 text-white hover:bg-white/20 transition-colors text-xs font-semibold"
              title="Hubungi tim ID-MAP via email"
            >
              <Info className="w-3.5 h-3.5" />
              Bantuan
            </a>
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-black transition-colors shadow-sm shadow-black/10 text-xs font-bold border border-gray-200"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative flex-1 w-full overflow-hidden animate-rise-fade" style={{ animationDelay: "120ms" }}>
        
        {/* ===== LEFT PANEL: Legend + layer checklist (desktop only) ===== */}
        <div className={`hidden md:flex absolute top-4 left-4 md:top-6 md:left-6 z-[500] transition-transform duration-300 ${isLegendOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)]"}`}>
          <div
            className="map-legend-panel bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-5 w-[300px] md:w-[320px] flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {/* Layer checklist — all indicators multi-select */}
            <div className="space-y-2 border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Indikator di peta
                </h4>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setAllLayers(true)} className="text-[10px] font-bold text-emerald-600 hover:underline">
                    Semua
                  </button>
                  <button type="button" onClick={() => setAllLayers(false)} className="text-[10px] font-bold text-gray-400 hover:underline">
                    Kosong
                  </button>
                </div>
              </div>
              {([
                { key: "mhi" as const, label: "MHI Mangrove", on: isMhiKmlOpen, color: "#1a9641" },
                { key: "prl" as const, label: "PRL · Ruang Laut", on: isPrlLayerOpen, color: "#14b8a6" },
                { key: "rtrw" as const, label: "RTRW Pola Ruang Darat", on: isRtrwDaratOpen, color: "#5b21b6" },
                { key: "abrasion" as const, label: "Abrasi Pantai", on: isAbrasionOpen, color: "#f97316" },
                { key: "turtle" as const, label: "Penyu", on: isTurtleLayerOpen, color: "#10b981" },
                { key: "pokmaswas" as const, label: "Mitra / Pokmaswas", on: isPokmaswasLayerOpen, color: "#6366f1" },
                { key: "inarisk" as const, label: "Banjir BNPB inaRISK", on: isInaRiskOpen, color: "#ef4444" },
              ]).map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={item.on}
                    onChange={() => toggleLayer(item.key)}
                  />
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                </label>
              ))}
              {anyLayerActive && (
                <p className="text-[10px] text-emerald-600 font-medium px-1">
                  {activeLayers.join(" + ")} ditampilkan
                </p>
              )}
            </div>

            {/* Sumber data: ground check vs satelit */}
            <div className="space-y-2 border-b border-gray-100 pb-3">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Sumber data
              </h4>
              {DATA_SOURCE_LEGEND.map((item) => (
                <div
                  key={item.key}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100"
                >
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5 border border-black/10"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-gray-900">{item.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
              <p className="text-[9px] text-gray-400 px-0.5 leading-snug">
                Layer di peta saat ini didominasi data ground check. GMW (satelit) dapat ditambah sebagai overlay pembanding.
              </p>
            </div>

            <div className="space-y-4">
              {isInaRiskOpen && (
                <div className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Banjir · BNPB inaRISK</h3>
                      <p className="text-red-600/70 text-[10px]">Klik area banjir (warna) · layer_bahaya_banjir_30</p>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Skala Bahaya Banjir</h4>
                  {INA_RISK_LEGEND.map((item) => (
                    <div key={item.level} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="w-5 h-5 rounded shadow-sm flex-shrink-0 mt-0.5 border border-white" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-gray-900 text-xs font-bold">{item.label}</span>
                          <span className="text-red-600 text-[10px] flex-shrink-0">Level {item.level}</span>
                        </div>
                        <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400">Sumber: gis.bnpb.go.id · inaRISK</p>
                </div>
              )}

              {isAbrasionOpen && (
                <div className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Waves className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Abrasi Pantai</h3>
                      <p className="text-orange-600/70 text-[10px]">Titik prioritas pesisir Jatim</p>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Prioritas Abrasi</h4>
                  {ABRASION_LEGEND.map((item) => (
                    <div key={item.key} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="w-5 h-5 rounded-full shadow-sm flex-shrink-0 mt-0.5 border-2 border-white ring-1 ring-black/10" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 text-xs font-bold block mb-0.5">{item.label}</span>
                        <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                      <p className="text-[10px] text-gray-400">Sumber: digitasi ground check · abrasi ID-MAP</p>
                    </div>
                  )}

                  {isRtrwDaratOpen && (
                <div className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Map className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">RTRW Pola Ruang Darat</h3>
                      <p className="text-indigo-600/70 text-[10px]">Rencana pola ruang (disederhanakan)</p>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Zona utama</h4>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {RTRW_LEGEND.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-100"
                      >
                        <div
                          className="w-4 h-4 rounded-sm flex-shrink-0 border border-black/10"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[11px] font-semibold text-gray-800 leading-snug">
                          {item.short || item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Warna legenda diset agar tidak bentrok MHI/PRL/BNPB. Layer = GeoJSON ringan (~1.8MB), bukan KMZ 491MB.
                  </p>
                </div>
              )}

              {(isMhiKmlOpen || (!isInaRiskOpen && !isAbrasionOpen && !isRtrwDaratOpen && !isPrlLayerOpen)) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">MHI Mangrove Jawa Timur</h3>
                      <p className="text-emerald-600/70 text-[10px]">Digitasi ground check · Dharmawan et al. 2021</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Skala Indeks MHI</h4>
                    <div className="flex h-3 rounded-full overflow-hidden shadow-inner border border-gray-100">
                      <div className="flex-1 bg-[#d7191c]" />
                      <div className="flex-1 bg-[#f5c542]" />
                      <div className="flex-1 bg-[#1a9641]" />
                    </div>
                    <div className="flex justify-between mt-1.5 px-1">
                      <span className="text-[10px] text-red-500 font-medium">0</span>
                      <span className="text-[10px] text-yellow-500 font-medium">33.3</span>
                      <span className="text-[10px] text-emerald-500 font-medium">66.6</span>
                      <span className="text-[10px] text-emerald-600 font-medium">100</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Klasifikasi MHI</h4>
                    {MHI_LEGEND.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
                        <div className="w-5 h-5 rounded shadow-sm flex-shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-gray-900 text-xs font-bold">{item.label}</span>
                            <span className="text-emerald-600 text-[10px] flex-shrink-0">({item.range})</span>
                          </div>
                          <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="absolute -right-10 top-4 bg-white/95 hover:bg-gray-50 text-emerald-600 p-2.5 rounded-r-xl shadow-lg backdrop-blur-md border border-l-0 border-gray-100 transition-colors"
          >
            {isLegendOpen ? <ChevronLeft className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>
        </div>

        {/* ===== RIGHT PANEL: Carbon Calculator (desktop only) ===== */}
        <div className={`hidden md:flex absolute top-4 right-4 md:top-6 md:right-6 z-[500] transition-transform duration-300 ${isCalculatorOpen ? "translate-x-0" : "translate-x-[calc(100%+24px)]"}`}>
          <button
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className="absolute -left-10 top-4 bg-white/95 hover:bg-gray-50 text-gray-700 p-2.5 rounded-l-xl shadow-lg backdrop-blur-md border border-r-0 border-gray-100 transition-colors"
          >
            {isCalculatorOpen ? <ChevronRight className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
          </button>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 w-[320px] md:w-[360px] flex flex-col gap-3 max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Kalkulator Karbon</h3>
            </div>

            {/* MHI Category Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-800 block mb-1.5">Kondisi MHI Area</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["excellent", "moderate", "poor"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMhiCategory(cat)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-[10px] font-bold ${
                      mhiCategory === cat
                        ? "border-gray-800 bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: carbonFactors[cat].color }} />
                    <span className="text-gray-700">{cat === "excellent" ? "Hijau" : cat === "moderate" ? "Kuning" : "Merah"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Area Input */}
            <div>
              <label className="text-xs font-semibold text-gray-800 block mb-1">
                {isDrawing ? "Luas Area Terukur" : "Luas Area (Hektar)"}
              </label>
              {isDrawing ? (
                <div className={`w-full px-3 py-2.5 border rounded-xl text-xl font-bold transition-all duration-300 ${areaHa > 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                  {areaHa > 0 ? areaHa.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : "0.00"} <span className="text-sm font-medium">Ha</span>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={areaHa || ""}
                  onChange={(e) => setAreaHa(parseFloat(e.target.value) || 0)}
                  placeholder="Contoh: 150"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              )}
            </div>

            {/* Annual Sequestration - PRIMARY */}
            <div className="relative overflow-visible rounded-2xl p-4 border" style={{ backgroundColor: `${factor.color}10`, borderColor: `${factor.color}30` }}>
              <div className="relative z-10">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">Serapan Karbon Tahunan</p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`font-bold leading-none ${annualSequestration >= 1000000 ? "text-2xl" : annualSequestration >= 100000 ? "text-3xl" : "text-4xl"}`} style={{ color: factor.color }}>
                    {annualSequestration.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm font-bold text-gray-600">tCO₂e/tahun</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-1">{factor.label} ({factor.annual} tCO₂e/ha/tahun)</p>
              </div>
            </div>

            {/* Carbon Stock - SECONDARY */}
            <div className="relative overflow-visible bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <div className="relative z-10">
                <p className="text-[10px] font-semibold text-gray-400 mb-0.5">Total Stok Karbon Tersimpan</p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`font-bold text-emerald-600 leading-none ${totalCarbonStock >= 10000000 ? "text-xl" : totalCarbonStock >= 1000000 ? "text-2xl" : "text-2xl"}`}>
                    {totalCarbonStock.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs font-bold text-gray-500">tCO₂e</span>
                </div>
                <p className="text-[9px] text-red-400 mt-1">⚠ Karbon yang terlepas ke atmosfer jika mangrove ini rusak/ditebang</p>
              </div>
            </div>

            {/* Equivalencies */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Serapan/tahun setara menetralkan emisi:</h4>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0"><Car className="w-4 h-4 text-orange-500" /></div>
                <div><span className="text-sm font-bold text-gray-800">{motorEquivalent.toLocaleString('id-ID')}</span> <span className="text-xs text-gray-500">Motor/tahun</span></div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><Plane className="w-4 h-4 text-blue-500" /></div>
                <div><span className="text-sm font-bold text-gray-800">{flightEquivalent.toLocaleString('id-ID')}</span> <span className="text-xs text-gray-500">Penerbangan JKT-Bali</span></div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0"><Home className="w-4 h-4 text-purple-500" /></div>
                <div><span className="text-sm font-bold text-gray-800">{homeEquivalent.toLocaleString('id-ID')}</span> <span className="text-xs text-gray-500">Rumah/tahun</span></div>
              </div>
            </div>

            <p className="text-[8px] text-gray-400 leading-relaxed border-t border-gray-100 pt-2">
              Sumber: Murdiyarso et al. (2015), IPCC Wetlands Supplement (2014), Komiyama et al. (2008)
            </p>
          </div>
        </div>

        {/* ===== MAIN MAP AREA ===== */}
        <div className="w-full h-full relative bg-[#062d22] animate-rise-fade" style={{ zIndex: 0, isolation: "isolate", animationDelay: "180ms" }}>
          {/* Shared satellite map + all stackable overlays */}
          <div className="w-full h-full overflow-hidden relative">
            <SharedInteractiveMap>
              {isMhiKmlOpen && <MhiOverlay fitOnLoad={!anyLayerActive || activeLayers[0] === "MHI"} />}
              {isRtrwDaratOpen && <RtrwOverlay fitOnLoad={activeLayers[0] === "RTRW"} />}
              {isPrlLayerOpen && <PrlOverlay fitOnLoad={activeLayers[0] === "PRL"} />}
              {isAbrasionOpen && <AbrasionOverlay fitOnLoad={activeLayers[0] === "Abrasi"} />}
              {isTurtleLayerOpen && <TurtleOverlay fitOnLoad={activeLayers[0] === "Penyu"} />}
              {isPokmaswasLayerOpen && <PokmaswasOverlay fitOnLoad={activeLayers[0] === "Mitra"} />}
              {isInaRiskOpen && <InaRiskOverlay fitOnLoad={activeLayers[0] === "BNPB"} />}
            </SharedInteractiveMap>
          </div>

          {/* Polygon Drawing - transparent Leaflet overlay */}
          {isDrawing && (
            <div className="absolute inset-0 z-[350]">
              <NativeMap onAreaCalculated={setAreaHa} transparent={true} />
            </div>
          )}


          {/* ===== MOBILE FAB: Legend + Calculator triggers ===== */}
          <div className="md:hidden absolute bottom-4 right-4 z-[450] flex flex-col gap-2">
            <button
              onClick={() => setMobileSheet(mobileSheet === "calculator" ? "none" : "calculator")}
              aria-label="Buka Kalkulator Karbon"
              className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-xl border border-emerald-400/40 flex items-center justify-center hover:bg-emerald-500 transition-colors"
            >
              <Calculator className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileSheet(mobileSheet === "legend" ? "none" : "legend")}
              aria-label="Buka Legenda MHI"
              className="w-12 h-12 rounded-full bg-white text-emerald-700 shadow-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* ===== MOBILE BOTTOM-SHEET ===== */}
          {mobileSheet !== "none" && (
            <>
              <div
                className="md:hidden fixed inset-0 bg-black/40 z-[700]"
                onClick={() => setMobileSheet("none")}
                aria-hidden
              />
              <div
                className="md:hidden fixed left-0 right-0 bottom-0 z-[710] bg-white rounded-t-2xl shadow-2xl border-t border-gray-100 max-h-[80vh] overflow-y-auto"
                style={mobileSheet === "legend" ? { fontFamily: "Arial, Helvetica, sans-serif" } : undefined}
              >
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {mobileSheet === "legend"
                      ? isRtrwDaratOpen
                        ? "Legenda RTRW Darat"
                        : isInaRiskOpen && isAbrasionOpen
                          ? "Legenda Banjir + Abrasi"
                          : isInaRiskOpen
                            ? "Legenda Banjir BNPB"
                            : isAbrasionOpen
                              ? "Legenda Abrasi"
                              : "Legenda Peta"
                      : "Kalkulator Karbon"}
                  </h3>
                  <button
                    onClick={() => setMobileSheet("none")}
                    aria-label="Tutup"
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  {mobileSheet === "legend" && (
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2 pb-2 border-b border-gray-100">
                        <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sumber data</h4>
                        {DATA_SOURCE_LEGEND.map((item) => (
                          <div key={item.key} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100">
                            <div className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5 border border-black/10" style={{ backgroundColor: item.color }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className="text-xs font-bold text-gray-900">{item.label}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeClass}`}>
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 leading-snug">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                        <p className="text-[9px] text-gray-400 leading-snug">
                          Layer aktif = ground check. GMW satelit = pembanding (opsional).
                        </p>
                      </div>
                      {isInaRiskOpen && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Skala Bahaya Banjir BNPB</h4>
                          {INA_RISK_LEGEND.map((item) => (
                            <div key={item.level} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100">
                              <div className="w-5 h-5 rounded shadow-sm flex-shrink-0 mt-0.5 border border-white" style={{ backgroundColor: item.color }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-gray-900 text-xs font-bold">{item.label}</span>
                                  <span className="text-red-600 text-[10px] flex-shrink-0">Level {item.level}</span>
                                </div>
                                <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                          <p className="text-[10px] text-gray-400">Sumber: gis.bnpb.go.id · inaRISK</p>
                        </div>
                      )}
                      {isAbrasionOpen && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Prioritas Abrasi</h4>
                          {ABRASION_LEGEND.map((item) => (
                            <div key={item.key} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100">
                              <div className="w-5 h-5 rounded-full shadow-sm flex-shrink-0 mt-0.5 border-2 border-white ring-1 ring-black/10" style={{ backgroundColor: item.color }} />
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-900 text-xs font-bold block mb-0.5">{item.label}</span>
                                <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                          <p className="text-[10px] text-gray-400">Sumber: digitasi ground check · abrasi ID-MAP</p>
                        </div>
                      )}
                      {isRtrwDaratOpen && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">RTRW Pola Ruang Darat</h4>
                          {RTRW_LEGEND.map((item) => (
                            <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-100">
                              <div className="w-4 h-4 rounded-sm flex-shrink-0 border border-black/10" style={{ backgroundColor: item.color }} />
                              <span className="text-[11px] font-semibold text-gray-800">{item.short || item.name}</span>
                            </div>
                          ))}
                          <p className="text-[10px] text-gray-400">GeoJSON ringan · warna anti-bentrok layer lain</p>
                        </div>
                      )}
                      {(isMhiKmlOpen || (!isInaRiskOpen && !isAbrasionOpen && !isRtrwDaratOpen)) && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Skala Indeks MHI</h4>
                          <div className="flex h-3 rounded-full overflow-hidden shadow-inner border border-gray-100">
                            <div className="flex-1 bg-[#d7191c]" />
                            <div className="flex-1 bg-[#f5c542]" />
                            <div className="flex-1 bg-[#1a9641]" />
                          </div>
                          <div className="flex justify-between mt-1.5 px-1">
                            <span className="text-[10px] text-red-500 font-medium">0</span>
                            <span className="text-[10px] text-yellow-500 font-medium">33.3</span>
                            <span className="text-[10px] text-emerald-500 font-medium">66.6</span>
                            <span className="text-[10px] text-emerald-600 font-medium">100</span>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Klasifikasi MHI</h4>
                            {MHI_LEGEND.map((item, i) => (
                              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100">
                                <div className="w-5 h-5 rounded shadow-sm flex-shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-gray-900 text-xs font-bold">{item.label}</span>
                                    <span className="text-emerald-600 text-[10px] flex-shrink-0">({item.range})</span>
                                  </div>
                                  <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-400">Sumber: digitasi ground check · Dharmawan et al. 2021</p>
                        </div>
                      )}
                    </div>
                  )}

                  {mobileSheet === "calculator" && (
                    <div className="flex flex-col gap-3">
                      {/* MHI Category Selector */}
                      <div>
                        <label className="text-xs font-semibold text-gray-800 block mb-1.5">Kondisi MHI Area</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["excellent", "moderate", "poor"] as const).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setMhiCategory(cat)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-[10px] font-bold ${
                                mhiCategory === cat
                                  ? "border-gray-800 bg-gray-50 shadow-sm"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: carbonFactors[cat].color }} />
                              <span className="text-gray-700">{cat === "excellent" ? "Hijau" : cat === "moderate" ? "Kuning" : "Merah"}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Area Input */}
                      <div>
                        <label className="text-xs font-semibold text-gray-800 block mb-1">
                          {isDrawing ? "Luas Area Terukur" : "Luas Area (Hektar)"}
                        </label>
                        {isDrawing ? (
                          <div className={`w-full px-3 py-2.5 border rounded-xl text-xl font-bold ${areaHa > 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                            {areaHa > 0 ? areaHa.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : "0.00"} <span className="text-sm font-medium">Ha</span>
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={areaHa || ""}
                            onChange={(e) => setAreaHa(parseFloat(e.target.value) || 0)}
                            placeholder="Contoh: 150"
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        )}
                      </div>

                      <div className="rounded-2xl p-4 border" style={{ backgroundColor: `${factor.color}10`, borderColor: `${factor.color}30` }}>
                        <p className="text-[10px] font-semibold text-gray-500 mb-1">Serapan Karbon Tahunan</p>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-bold text-3xl leading-none" style={{ color: factor.color }}>
                            {annualSequestration.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-sm font-bold text-gray-600">tCO₂e/tahun</span>
                        </div>
                      </div>

                      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 mb-0.5">Total Stok Karbon Tersimpan</p>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-bold text-emerald-600 text-2xl leading-none">
                            {totalCarbonStock.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-xs font-bold text-gray-500">tCO₂e</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Setara menetralkan emisi:</h4>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center"><Car className="w-4 h-4 text-orange-500" /></div>
                          <div><span className="text-sm font-bold text-gray-800">{motorEquivalent.toLocaleString('id-ID')}</span> <span className="text-xs text-gray-500">Motor/tahun</span></div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Plane className="w-4 h-4 text-blue-500" /></div>
                          <div><span className="text-sm font-bold text-gray-800">{flightEquivalent.toLocaleString('id-ID')}</span> <span className="text-xs text-gray-500">Penerbangan JKT-Bali</span></div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center"><Home className="w-4 h-4 text-purple-500" /></div>
                          <div><span className="text-sm font-bold text-gray-800">{homeEquivalent.toLocaleString('id-ID')}</span> <span className="text-xs text-gray-500">Rumah/tahun</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {isScoringOpen && <ScoringPanel onClose={() => setIsScoringOpen(false)} />}
    </div>
  );
}
