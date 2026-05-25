"use client";

import {
  ChevronLeft, ChevronRight, Calculator, PenTool, Layers, Info,
  Loader2, Leaf, Car, Plane, Home, Globe, Waves, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const NativeMap = dynamic(() => import("@/components/map/NativeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
    </div>
  ),
});

const TurtleLayer = dynamic(() => import("@/components/map/TurtleLayer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0F2E2A] z-[400]">
      <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
    </div>
  ),
});

const AbrasionMap = dynamic(() => import("@/components/map/AbrasionMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0F2E2A] z-[400]">
      <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
    </div>
  ),
});

const EE_APP_URL =
  "https://ee-dimassyarifworkspace.projects.earthengine.app/view/mangrove-health-indeks-jatim";

const MHI_LEGEND = [
  { color: "#1a9641", label: "Excellent", range: "> 66.6", desc: "Mangrove sangat sehat, kerapatan tinggi" },
  { color: "#f5c542", label: "Moderate", range: "33.3 - 66.6", desc: "Kondisi sedang, perlu pemantauan" },
  { color: "#d7191c", label: "Poor", range: "< 33.3", desc: "Kondisi kritis, butuh rehabilitasi" },
];

export default function JelajahiPetaMangrovePage() {
  const [areaHa, setAreaHa] = useState<number>(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isEEPanelOpen, setIsEEPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mhiCategory, setMhiCategory] = useState<"excellent" | "moderate" | "poor">("excellent");
  const [isAbrasionOpen, setIsAbrasionOpen] = useState(false);
  const [isTurtleLayerOpen, setIsTurtleLayerOpen] = useState(false);
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

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
    <div className="fixed inset-0 z-[100] bg-[#0F2E2A] flex flex-col font-sans">
      {/* ===== TOP NAVBAR ===== */}
      <header className="h-auto min-h-[72px] py-2 bg-[#0F2E2A] border-b border-[#235850] flex flex-wrap items-center justify-between px-4 sm:px-6 z-[600] relative shadow-lg shadow-black/20 gap-4">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10 hidden sm:flex">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base sm:text-lg tracking-wide flex flex-wrap items-center gap-1 sm:gap-2">
              MANGROVE
              <span className="font-light text-emerald-400">HEALTH INDEX & COASTAL ECOSYSTEM</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-100/50 uppercase tracking-wider font-medium mt-0.5">
              <span>Powered by</span>
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <Globe className="w-2 h-2 text-blue-500" />
              </div>
              <span className="text-white/80">Google Earth Engine</span>
            </div>
          </div>
        </div>

        {/* Center: Action buttons */}
        <div className="flex items-center gap-2 shrink-0 mx-auto">
          <button
            onClick={() => setIsDrawing(!isDrawing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-bold border ${
              isDrawing
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400"
                : "bg-[#062d22] text-white hover:bg-emerald-600 border-[#235850] hover:border-emerald-400"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {isDrawing ? "Sedang Menggambar..." : "Gambar Polygon"}
          </button>

          {/* Layer dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLayerDropdownOpen((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-bold border ${
                isLayerDropdownOpen || isAbrasionOpen || isTurtleLayerOpen
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20 border-teal-400"
                  : "bg-[#062d22] text-white hover:bg-teal-600 border-[#235850] hover:border-teal-400"
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Layer</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLayerDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isLayerDropdownOpen && (
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-[550]" onClick={() => setIsLayerDropdownOpen(false)} />
                <div className="absolute top-full mt-2 left-0 z-[560] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[180px]">
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pilih Layer</p>
                  <button
                    onClick={() => {
                      setIsAbrasionOpen(true);
                      setIsTurtleLayerOpen(false);
                      setIsLayerDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-left transition-colors hover:bg-orange-50 ${
                      isAbrasionOpen ? "bg-orange-50 text-orange-600" : "text-gray-700"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Waves className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    Abrasi Pantai
                  </button>
                  <button
                    onClick={() => {
                      setIsTurtleLayerOpen(true);
                      setIsAbrasionOpen(false);
                      setIsLayerDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-left transition-colors hover:bg-teal-50 ${
                      isTurtleLayerOpen ? "bg-teal-50 text-teal-600" : "text-gray-700"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 text-base">
                      🐢
                    </div>
                    Penyu
                  </button>
                  <div className="h-px bg-gray-100 mx-3 my-1" />
                  <p className="px-3 pb-2.5 text-[10px] text-gray-400">
                    {isAbrasionOpen ? "Abrasi Pantai aktif" : isTurtleLayerOpen ? "Penyu aktif" : "Tidak ada layer aktif"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#235850] text-emerald-100 hover:bg-[#163F3A] transition-colors text-xs font-medium">
            <Info className="w-3.5 h-3.5" />
            Bantuan
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#163F3A] hover:bg-[#235850] text-emerald-100 hover:text-white transition-colors border border-[#235850] shadow-sm text-xs font-bold"
            title="Kembali ke Beranda"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative flex-1 w-full overflow-hidden">
        
        {/* ===== LEFT PANEL: MHI Legend (always visible) ===== */}
        <div className={`absolute top-4 left-4 md:top-6 md:left-6 z-[500] flex transition-transform duration-300 ${isLegendOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)]"}`}>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-5 w-[300px] md:w-[320px] flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">MHI Mangrove Jawa Timur</h3>
                <p className="text-emerald-600/70 text-[10px]">Dharmawan et al. 2021</p>
              </div>
            </div>

            {/* MHI Color Scale Bar */}
            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Skala Indeks MHI</h4>
              <div className="flex h-3 rounded-full overflow-hidden shadow-inner border border-gray-100">
                <div className="flex-1 bg-[#d7191c]" />
                <div className="flex-1 bg-[#f5c542]" />
                <div className="flex-1 bg-[#1a9641]" />
              </div>
              <div className="flex justify-between mt-1.5 px-1">
                <span className="text-[10px] text-red-500 font-mono font-medium">0</span>
                <span className="text-[10px] text-yellow-500 font-mono font-medium">33.3</span>
                <span className="text-[10px] text-emerald-500 font-mono font-medium">66.6</span>
                <span className="text-[10px] text-emerald-600 font-mono font-medium">100</span>
              </div>
            </div>

            {/* Klasifikasi MHI */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Klasifikasi MHI</h4>
              {MHI_LEGEND.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
                  <div className="w-5 h-5 rounded shadow-sm flex-shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-gray-900 text-xs font-bold">{item.label}</span>
                      <span className="text-emerald-600 text-[10px] font-mono flex-shrink-0">({item.range})</span>
                    </div>
                    <p className="text-gray-500 text-[10px] leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
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

        {/* ===== RIGHT PANEL: Carbon Calculator ===== */}
        <div className={`absolute top-4 right-4 md:top-6 md:right-6 z-[500] flex transition-transform duration-300 ${isCalculatorOpen ? "translate-x-0" : "translate-x-[calc(100%+24px)]"}`}>
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
                <div className={`w-full px-3 py-2.5 border rounded-xl text-xl font-bold transition-all duration-300 ${areaHa > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
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
        <div className="w-full h-full relative bg-[#062d22]" style={{ zIndex: 0, isolation: "isolate" }}>
          {/* MHI Earth Engine iframe (always visible as base layer) */}
          <div className="w-full h-full overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F2E2A] z-10">
                <Loader2 className="h-12 w-12 text-[#22C55E] animate-spin mb-4" />
                <p className="text-[#E6F4F1] text-base font-medium">Memuat Peta MHI Mangrove...</p>
                <p className="text-[#E6F4F1]/50 text-xs mt-2">Menghubungkan ke Google Earth Engine...</p>
              </div>
            )}

            {/* EE Filter toggle */}
            <button
              onClick={() => setIsEEPanelOpen(!isEEPanelOpen)}
              className={`absolute top-[40%] z-[300] bg-white/90 hover:bg-white text-emerald-800 p-2 shadow-lg backdrop-blur-md border border-gray-200 transition-all duration-500 rounded-r-xl border-l-0 flex items-center gap-2 ${
                isEEPanelOpen ? "left-[300px]" : "left-0"
              }`}
              title={isEEPanelOpen ? "Tutup Filter EE" : "Buka Filter Wilayah & Tahun"}
            >
              {isEEPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {!isEEPanelOpen && <span className="text-[10px] font-bold uppercase tracking-wider py-2" style={{ writingMode: 'vertical-rl' }}>Filter</span>}
            </button>

            <iframe
              src={EE_APP_URL}
              className="border-0 max-w-none transition-all duration-500 ease-in-out"
              style={{ 
                height: 'calc(100% + 120px)', 
                marginTop: '-120px',
                width: 'calc(100% + 380px)',
                marginLeft: isEEPanelOpen ? '0px' : '-300px',
                clipPath: 'inset(0 300px 0 0)',
              }}
              allow="geolocation; fullscreen"
              onLoad={() => setIsLoading(false)}
              title="Mangrove Health Index & Coastal Ecosystem - Jawa Timur"
            />
          </div>

          {/* Polygon Drawing - transparent Leaflet overlay, MHI stays visible */}
          {isDrawing && (
            <div className="absolute inset-0 z-[350]">
              <NativeMap onAreaCalculated={setAreaHa} transparent={true} />
            </div>
          )}

          {/* Abrasi Pantai - full satellite map with pins */}
          {isAbrasionOpen && (
            <AbrasionMap onClose={() => setIsAbrasionOpen(false)} />
          )}

          {/* Turtle Layer - full Leaflet map with satellite tiles */}
          {isTurtleLayerOpen && (
            <TurtleLayer onClose={() => setIsTurtleLayerOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
