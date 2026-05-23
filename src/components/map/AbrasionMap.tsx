"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  ABRASION_SITES,
  PRIORITAS_CONFIG,
  type PrioritasType,
  type AbrasionSite,
} from "@/lib/abrasionData";
import { X, Waves, TreePine, ChevronDown, ChevronUp } from "lucide-react";

// ─────────────────────────────────────────
// Icon factory
// ─────────────────────────────────────────
function makeIcon(color: string, no: number, selected: boolean) {
  const size = selected ? 40 : 30;
  const ring = selected
    ? `outline:3px solid white;outline-offset:2px;`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:${selected ? 3 : 2.5}px solid #fff;
      border-radius:50%;
      box-shadow:0 ${selected ? 5 : 2}px ${selected ? 14 : 8}px rgba(0,0,0,${selected ? 0.55 : 0.35});
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? 13 : 10}px;font-weight:800;color:#fff;
      cursor:pointer;
      ${ring}
    ">${no}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
}

function buildPopup(site: AbrasionSite, dotColor: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;min-width:195px;max-width:255px">
      <div style="font-weight:700;font-size:13px;margin-bottom:3px;color:#111">${site.namaPantai}</div>
      <div style="font-size:10px;color:#888;margin-bottom:6px">${site.kecamatanKab}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px">
        <span style="background:${dotColor}22;color:${dotColor};border:1px solid ${dotColor}44;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">${site.prioritas}</span>
        <span style="background:#f3f4f6;padding:2px 7px;border-radius:4px;font-size:10px;color:#555">${site.substrat}</span>
        <span style="background:#f3f4f6;padding:2px 7px;border-radius:4px;font-size:10px;color:#555">${site.luasan}</span>
      </div>
      <p style="font-size:11px;color:#444;margin-bottom:6px;line-height:1.4">${site.indikasiAbrasi}</p>
      <div style="border-top:1px solid #f0f0f0;padding-top:5px">
        <p style="font-size:9px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px">Tanaman Rekomendasi</p>
        <p style="font-size:10px;color:#16a34a;line-height:1.6">${site.tanamanRekomendasi.map((t) => `• ${t}`).join("<br/>")}</p>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// Fit all sites on first load
// ─────────────────────────────────────────
function FitAll() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      ABRASION_SITES.map((s) => [s.lat, s.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 10 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// ─────────────────────────────────────────
// Fly to selected site
// ─────────────────────────────────────────
function FlyController({ selectedNo }: { selectedNo: number | null }) {
  const map = useMap();
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedNo === null || selectedNo === prevRef.current) return;
    prevRef.current = selectedNo;
    const site = ABRASION_SITES.find((s) => s.no === selectedNo);
    if (site) {
      map.flyTo([site.lat, site.lng], 13, {
        duration: 1.2,
        easeLinearity: 0.5,
      });
    }
  }, [selectedNo, map]);

  return null;
}

// ─────────────────────────────────────────
// Marker layer (vanilla Leaflet for dynamic icon updates)
// ─────────────────────────────────────────
function MarkerLayer({
  selectedNo,
  onSelect,
}: {
  selectedNo: number | null;
  onSelect: (no: number) => void;
}) {
  const map = useMap();
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create markers once
  useEffect(() => {
    ABRASION_SITES.forEach((site) => {
      const cfg = PRIORITAS_CONFIG[site.prioritas];
      const marker = L.marker([site.lat, site.lng], {
        icon: makeIcon(cfg.dot, site.no, false),
      });
      marker.bindPopup(buildPopup(site, cfg.dot), { maxWidth: 270 });
      marker.on("click", () => onSelectRef.current(site.no));
      marker.addTo(map);
      markersRef.current.set(site.no, marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update icon whenever selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, no) => {
      const site = ABRASION_SITES.find((s) => s.no === no)!;
      const cfg = PRIORITAS_CONFIG[site.prioritas];
      const isSelected = selectedNo === no;
      marker.setIcon(makeIcon(cfg.dot, no, isSelected));
      if (isSelected) marker.openPopup();
    });
  }, [selectedNo]);

  return null;
}

// ─────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────
export default function AbrasionMap({ onClose }: { onClose: () => void }) {
  const [selectedNo, setSelectedNo] = useState<number | null>(null);
  const [filter, setFilter] = useState<PrioritasType | "Semua">("Semua");
  const [listOpen, setListOpen] = useState(true);

  const filtered = ABRASION_SITES.filter(
    (s) => filter === "Semua" || s.prioritas === filter
  );

  const handleSelect = (no: number) => {
    setSelectedNo((prev) => (prev === no ? null : no));
  };

  const listH = "38vh";

  return (
    <div className="absolute inset-0 z-[400] flex flex-col">
      {/* ── Top header ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-white/97 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex flex-wrap items-center gap-3 max-w-[calc(100vw-32px)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Waves className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Abrasi Pantai</p>
            <p className="text-[10px] text-gray-500">15 lokasi · Jawa Timur</p>
          </div>
        </div>

        {/* Priority filters */}
        <div className="flex items-center gap-1.5 pl-3 border-l border-gray-200">
          {(["Semua", "Tinggi", "Sedang", "Rendah–Sedang"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                filter === f
                  ? f === "Tinggi"
                    ? "bg-red-500 text-white border-red-500"
                    : f === "Sedang"
                    ? "bg-amber-500 text-white border-amber-500"
                    : f === "Rendah–Sedang"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Leaflet map ── */}
      <MapContainer
        center={[-8.3, 113.0]}
        zoom={9}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
        <FitAll />
        <FlyController selectedNo={selectedNo} />
        <MarkerLayer selectedNo={selectedNo} onSelect={handleSelect} />
      </MapContainer>

      {/* ── Priority legend ── */}
      <div
        className="absolute right-5 z-[500] bg-white/97 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 px-4 py-3 space-y-2 transition-all duration-300"
        style={{ bottom: listOpen ? `calc(${listH} + 16px)` : "80px" }}
      >
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Prioritas</p>
        {(Object.entries(PRIORITAS_CONFIG) as [PrioritasType, typeof PRIORITAS_CONFIG[PrioritasType]][]).map(
          ([prio, cfg]) => (
            <div key={prio} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-[2px] border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: cfg.dot }}
              />
              <span className="text-[11px] text-gray-700 font-medium">{prio}</span>
            </div>
          )
        )}
        <div className="pt-1.5 border-t border-gray-100 text-[10px] text-gray-400">
          {ABRASION_SITES.filter((s) => s.prioritas === "Tinggi").length} Tinggi ·{" "}
          {ABRASION_SITES.filter((s) => s.prioritas === "Sedang").length} Sedang ·{" "}
          {ABRASION_SITES.filter((s) => s.prioritas === "Rendah–Sedang").length} Rendah–Sedang
        </div>
      </div>

      {/* ── Bottom list panel ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[500] transition-transform duration-300 ${
          listOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle to toggle list */}
        <button
          onClick={() => setListOpen((v) => !v)}
          className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white/97 backdrop-blur-md px-5 py-1.5 rounded-t-xl shadow-lg border border-b-0 border-gray-200 flex items-center gap-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {listOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
          Daftar Lokasi
          <span className="ml-1 text-gray-400 font-normal hidden sm:inline">
            — klik kartu → zoom ke pin
          </span>
        </button>

        <div
          className="bg-white/97 backdrop-blur-md border-t border-gray-200 shadow-2xl"
          style={{ maxHeight: listH }}
        >
          {/* Stats bar */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 text-[10px] font-medium text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Tinggi: {ABRASION_SITES.filter((s) => s.prioritas === "Tinggi").length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Sedang: {ABRASION_SITES.filter((s) => s.prioritas === "Sedang").length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              Rendah–Sedang: {ABRASION_SITES.filter((s) => s.prioritas === "Rendah–Sedang").length}
            </span>
          </div>

          {/* Cards grid */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `calc(${listH} - 36px)` }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-100">
              {filtered.map((site) => {
                const cfg = PRIORITAS_CONFIG[site.prioritas];
                const isSelected = selectedNo === site.no;
                return (
                  <div
                    key={site.no}
                    onClick={() => handleSelect(site.no)}
                    className={`bg-white p-3 cursor-pointer transition-all duration-150 hover:bg-orange-50/60 ${
                      isSelected
                        ? "ring-2 ring-inset ring-orange-400 bg-orange-50/40"
                        : ""
                    }`}
                  >
                    {/* Number pin + name */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: cfg.dot }}
                      >
                        {site.no}
                      </div>
                      <span className="text-xs font-bold text-gray-900 truncate leading-tight">
                        {site.namaPantai}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 truncate mb-1.5 leading-tight">
                      {site.kecamatanKab}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
                      >
                        {site.prioritas}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {site.substrat}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-orange-100 space-y-1.5">
                        <div className="text-[10px] text-gray-500 leading-snug">
                          {site.indikasiAbrasi}
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mb-0.5">
                            <TreePine className="w-3 h-3" /> Rekomendasi
                          </p>
                          {site.tanamanRekomendasi.slice(0, 2).map((t, i) => (
                            <p key={i} className="text-[9px] text-emerald-700 leading-snug">
                              • {t}
                            </p>
                          ))}
                          {site.tanamanRekomendasi.length > 2 && (
                            <p className="text-[9px] text-gray-400">
                              +{site.tanamanRekomendasi.length - 2} lainnya
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
