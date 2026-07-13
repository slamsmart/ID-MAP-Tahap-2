"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, Loader2 } from "lucide-react";

type LayerKey = "konservasi" | "pemanfaatan";

const LAYER_CONFIG: Record<LayerKey, { label: string; url: string; color: string; emoji: string }> = {
  konservasi: {
    label: "Kawasan Konservasi",
    url: "/geodata/polaruang_konservasi.geojson",
    color: "#16a34a",
    emoji: "🌿",
  },
  pemanfaatan: {
    label: "Kawasan Pemanfaatan",
    url: "/geodata/polaruang_pemanfaatan.geojson",
    color: "#2563eb",
    emoji: "🏗️",
  },
};

type GeoFeature = {
  type: "Feature";
  properties: { name: string; fillColor: string; fillOpacity: number };
  geometry: { type: string; coordinates: unknown };
};
type GeoCollection = { type: "FeatureCollection"; features: GeoFeature[] };

function GeoJsonLayer({
  data,
  onFeatureCount,
}: {
  data: GeoCollection;
  onFeatureCount: (n: number) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!data?.features?.length) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    layerRef.current = L.geoJSON(data as unknown as L.GeoJsonObject, {
      style: (feature) => ({
        fillColor: feature?.properties?.fillColor ?? "#88ccaa",
        fillOpacity: feature?.properties?.fillOpacity ?? 0.45,
        color: "#fff",
        weight: 0.5,
        opacity: 0.7,
      }),
      onEachFeature: (feature, layer) => {
        if (feature.properties?.name) {
          layer.bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;font-weight:600;color:#1f2937;padding:2px 0">${feature.properties.name}</div>`,
            { maxWidth: 240, closeButton: false }
          );
          layer.on("mouseover", function (this: L.Layer) {
            (this as L.Path).setStyle?.({ weight: 2, opacity: 1 });
            (this as L.Popup & { openPopup?: () => void }).openPopup?.();
          });
          layer.on("mouseout", function (this: L.Layer) {
            layerRef.current?.resetStyle(this as L.Path);
            (this as L.Popup & { closePopup?: () => void }).closePopup?.();
          });
        }
      },
    }).addTo(map);

    onFeatureCount(data.features.length);

    const bounds = layerRef.current.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return null;
}

interface PolaruangLayerProps {
  onClose: () => void;
}

export default function PolaruangLayer({ onClose }: PolaruangLayerProps) {
  const [activeLayer, setActiveLayer] = useState<LayerKey>("konservasi");
  const [geoData, setGeoData] = useState<Record<LayerKey, GeoCollection | null>>({
    konservasi: null,
    pemanfaatan: null,
  });
  const [loading, setLoading] = useState<Record<LayerKey, boolean>>({
    konservasi: true,
    pemanfaatan: false,
  });
  const [featureCount, setFeatureCount] = useState(0);

  // Pre-fetch aktif layer, lazy-fetch lainnya saat switch
  useEffect(() => {
    loadLayer("konservasi");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLayer(key: LayerKey) {
    if (geoData[key]) return; // already cached
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(LAYER_CONFIG[key].url);
      const json: GeoCollection = await res.json();
      setGeoData((prev) => ({ ...prev, [key]: json }));
    } catch (err) {
      console.error("Failed to load", key, err);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function switchLayer(key: LayerKey) {
    setActiveLayer(key);
    loadLayer(key);
  }

  const cfg = LAYER_CONFIG[activeLayer];
  const isLoading = loading[activeLayer];
  const data = geoData[activeLayer];

  return (
    <div className="absolute inset-0 z-[400] flex flex-col">
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 min-w-max max-w-[90vw]">
        <span className="text-xl">{cfg.emoji}</span>
        <div>
          <p className="text-sm font-bold text-gray-900">Pola Ruang Laut — Jawa Timur</p>
          <p className="text-[10px] text-gray-500">
            {isLoading ? "Memuat data..." : `${featureCount.toLocaleString("id-ID")} kawasan`}
          </p>
        </div>

        {/* Layer toggle */}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
          {(["konservasi", "pemanfaatan"] as LayerKey[]).map((k) => (
            <button
              key={k}
              onClick={() => switchLayer(k)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                activeLayer === k
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
              style={activeLayer === k ? { backgroundColor: LAYER_CONFIG[k].color, borderColor: LAYER_CONFIG[k].color } : {}}
            >
              {LAYER_CONFIG[k].emoji}
              <span className="hidden sm:inline">{k === "konservasi" ? "Konservasi" : "Pemanfaatan"}</span>
            </button>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[550] flex items-center justify-center bg-[#0F2E2A]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-white/80 text-sm font-medium">Memuat {cfg.label}...</p>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[-7.4, 112.8]}
        zoom={8}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={18}
        />

        {data && (
          <GeoJsonLayer
            key={activeLayer}
            data={data}
            onFeatureCount={setFeatureCount}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 px-4 py-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Legenda</p>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-white shadow-sm" style={{ backgroundColor: cfg.color, opacity: 0.7 }} />
          <span className="text-xs text-gray-700 font-medium">{cfg.label}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Sumber: Pola Ruang Laut Jawa Timur
        </p>
      </div>
    </div>
  );
}
