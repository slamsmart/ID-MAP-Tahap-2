"use client";

import { useEffect, useState } from "react";
import { MapContainer, useMap } from "react-leaflet";
import L from "leaflet";
import { X } from "lucide-react";
import {
  INA_RISK_LEGEND,
  INARISK_BANJIR_MAPSERVER,
  buildInaRiskPopupHtml,
  classifyInaRisk,
  createInaRiskPinIcon,
  parseIdentifyPixel,
} from "./inaRiskLegend";

const JATIM_CITIES: { name: string; lat: number; lng: number; type: "kota" | "kabupaten" }[] = [
  { name: "Surabaya", lat: -7.2575, lng: 112.7521, type: "kota" },
  { name: "Malang", lat: -7.9797, lng: 112.6304, type: "kota" },
  { name: "Madiun", lat: -7.6298, lng: 111.5239, type: "kota" },
  { name: "Mojokerto", lat: -7.4723, lng: 111.4423, type: "kota" },
  { name: "Blitar", lat: -8.0957, lng: 112.1609, type: "kota" },
  { name: "Probolinggo", lat: -7.7543, lng: 113.2159, type: "kota" },
  { name: "Pasuruan", lat: -7.6456, lng: 112.9036, type: "kota" },
  { name: "Kediri", lat: -7.8165, lng: 112.0115, type: "kota" },
  { name: "Batu", lat: -7.8662, lng: 112.5267, type: "kota" },
  { name: "Kab. Gresik", lat: -7.1569, lng: 112.6520, type: "kabupaten" },
  { name: "Kab. Sidoarjo", lat: -7.4478, lng: 112.7183, type: "kabupaten" },
  { name: "Kab. Mojokerto", lat: -7.5236, lng: 111.5325, type: "kabupaten" },
  { name: "Kab. Jombang", lat: -7.5495, lng: 112.2384, type: "kabupaten" },
  { name: "Kab. Lamongan", lat: -7.1176, lng: 112.4157, type: "kabupaten" },
  { name: "Kab. Bojonegoro", lat: -7.1507, lng: 111.8817, type: "kabupaten" },
  { name: "Kab. Tuban", lat: -6.8997, lng: 112.0508, type: "kabupaten" },
  { name: "Kab. Ngawi", lat: -7.4052, lng: 111.4467, type: "kabupaten" },
  { name: "Kab. Magetan", lat: -7.6531, lng: 111.3291, type: "kabupaten" },
  { name: "Kab. Ponorogo", lat: -7.8654, lng: 111.4633, type: "kabupaten" },
  { name: "Kab. Pacitan", lat: -8.1958, lng: 111.1027, type: "kabupaten" },
  { name: "Kab. Trenggalek", lat: -8.0553, lng: 111.7082, type: "kabupaten" },
  { name: "Kab. Tulungagung", lat: -8.0650, lng: 111.9028, type: "kabupaten" },
  { name: "Kab. Blitar", lat: -8.0981, lng: 112.1684, type: "kabupaten" },
  { name: "Kab. Kediri", lat: -7.8319, lng: 111.9594, type: "kabupaten" },
  { name: "Kab. Nganjuk", lat: -7.6040, lng: 111.9029, type: "kabupaten" },
  { name: "Kab. Madiun", lat: -7.6298, lng: 111.5239, type: "kabupaten" },
  { name: "Kab. Malang", lat: -8.1845, lng: 112.6285, type: "kabupaten" },
  { name: "Kab. Lumajang", lat: -8.1348, lng: 113.2236, type: "kabupaten" },
  { name: "Kab. Jember", lat: -8.1724, lng: 113.7022, type: "kabupaten" },
  { name: "Kab. Bondowoso", lat: -7.9109, lng: 113.8228, type: "kabupaten" },
  { name: "Kab. Situbondo", lat: -7.7059, lng: 113.9989, type: "kabupaten" },
  { name: "Kab. Banyuwangi", lat: -8.2192, lng: 114.3691, type: "kabupaten" },
  { name: "Kab. Probolinggo", lat: -7.8137, lng: 113.1747, type: "kabupaten" },
  { name: "Kab. Pasuruan", lat: -7.6441, lng: 112.9017, type: "kabupaten" },
  { name: "Kab. Bangkalan", lat: -7.0437, lng: 112.7339, type: "kabupaten" },
  { name: "Kab. Sampang", lat: -7.1826, lng: 113.2453, type: "kabupaten" },
  { name: "Kab. Pamekasan", lat: -7.1580, lng: 113.4794, type: "kabupaten" },
  { name: "Kab. Sumenep", lat: -7.0150, lng: 113.8616, type: "kabupaten" },
];

const GEOJSON_URL = "/data/east-java.geojson";

// Kabupaten/kota yang berbatasan langsung dengan laut (pesisir Jawa Timur + Madura)
const PESISIR_NAMES = new Set([
  "Kota Surabaya", "Surabaya",
  "Kota Probolinggo", "Probolinggo",
  "Kota Pasuruan", "Pasuruan",
  "Kabupaten Gresik", "Gresik",
  "Kabupaten Sidoarjo", "Sidoarjo",
  "Kabupaten Lamongan", "Lamongan",
  "Kabupaten Tuban", "Tuban",
  "Kabupaten Situbondo", "Situbondo",
  "Kabupaten Banyuwangi", "Banyuwangi",
  "Kabupaten Probolinggo",
  "Kabupaten Pasuruan",
  "Kabupaten Lumajang", "Lumajang",
  "Kabupaten Jember", "Jember",
  "Kabupaten Malang", "Malang",
  "Kabupaten Trenggalek", "Trenggalek",
  "Kabupaten Tulungagung", "Tulungagung",
  "Kabupaten Blitar", "Blitar",
  "Kabupaten Pacitan", "Pacitan",
  "Kabupaten Bangkalan", "Bangkalan",
  "Kabupaten Sampang", "Sampang",
  "Kabupaten Pamekasan", "Pamekasan",
  "Kabupaten Sumenep", "Sumenep",
]);

function isPesisir(props: Record<string, unknown>): boolean {
  const name: string =
    (props?.KABKOT as string) ||
    (props?.name as string) ||
    (props?.NAME_2 as string) ||
    (props?.WADMKK as string) ||
    "";
  return (
    PESISIR_NAMES.has(name) ||
    Array.from(PESISIR_NAMES).some((n) => name.includes(n) || n.includes(name))
  );
}

function PolygonLayer({ geojson }: { geojson: GeoJSON.FeatureCollection | null }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    const layer = L.geoJSON(geojson, {
      filter: (feature) => isPesisir(feature.properties ?? {}),
      style: {
        // Palet standar BNPB inaRISK (kuning → oranye → oranye tua)
        color: "#ff6b0c",
        weight: 2,
        fillColor: "#ffa916",
        fillOpacity: 0.18,
        dashArray: undefined,
      },
      onEachFeature(feature, lyr) {
        const name: string =
          feature.properties?.KABKOT ||
          feature.properties?.name ||
          feature.properties?.NAME_2 ||
          feature.properties?.WADMKK ||
          "";
        if (name) {
          lyr.bindTooltip(name, {
            permanent: false,
            direction: "center",
            className: "leaflet-label-kabkot",
          });
        }
      },
    });
    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map, geojson]);
  return null;
}

function CityLabels() {
  const map = useMap();
  useEffect(() => {
    const markers: L.Marker[] = JATIM_CITIES.map((city) => {
      const isKota = city.type === "kota";
      const icon = L.divIcon({
        className: "",
        html: `<div style="pointer-events:none;text-align:center;">
          <div style="
            display:inline-block;
            background:${isKota ? "rgba(30,58,138,0.85)" : "rgba(0,0,0,0.55)"};
            color:white;
            font-size:${isKota ? 11 : 9}px;
            font-weight:${isKota ? 700 : 500};
            padding:2px 5px;
            border-radius:4px;
            white-space:nowrap;
            border:1px solid rgba(255,255,255,0.3);
          ">${city.name}</div>
        </div>`,
        iconAnchor: [40, 10],
        iconSize: [80, 20],
      });
      const marker = L.marker([city.lat, city.lng], { icon, interactive: false });
      marker.addTo(map);
      return marker;
    });
    return () => { markers.forEach((m) => map.removeLayer(m)); };
  }, [map]);
  return null;
}

const JATIM_BOUNDS: [[number, number], [number, number]] = [
  [-8.9, 109.8],
  [-6.9, 115.5],
];

function BanjirLayer() {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    let activePin: L.Marker | null = null;
    let requestId = 0;

    if (!map.getPane("inariskPinPane")) {
      map.createPane("inariskPinPane");
      const pane = map.getPane("inariskPinPane");
      if (pane) pane.style.zIndex = "630";
    }

    const layer = (L.GridLayer as unknown as { extend: (opts: object) => new () => L.GridLayer }).extend({
      createTile(coords: L.Coords, done: (err: Error | null, tile: HTMLElement) => void) {
        const img = document.createElement("img");
        const tileSizePx = 256;
        const nw = map.unproject(
          [(coords.x * tileSizePx), (coords.y * tileSizePx)],
          coords.z
        );
        const se = map.unproject(
          [((coords.x + 1) * tileSizePx), ((coords.y + 1) * tileSizePx)],
          coords.z
        );
        const params = new URLSearchParams({
          bbox: `${nw.lng},${se.lat},${se.lng},${nw.lat}`,
          bboxSR: "4326",
          imageSR: "4326",
          size: `${tileSizePx},${tileSizePx}`,
          dpi: "96",
          format: "png32",
          transparent: "true",
          f: "image",
          layers: "show:0",
        });
        img.alt = "";
        img.style.opacity = "0.7";
        img.style.width = `${tileSizePx}px`;
        img.style.height = `${tileSizePx}px`;
        img.onload = () => done(null, img);
        img.onerror = () => done(new Error("tile load failed"), img);
        img.src = `${INARISK_BANJIR_MAPSERVER}?${params.toString()}`;
        return img;
      },
    });
    const banjirLayer = new (layer as unknown as new (opts?: L.GridLayerOptions) => L.GridLayer)({
      opacity: 0.75,
      updateWhenIdle: true,
    });
    banjirLayer.addTo(map);

    const clearPin = () => {
      if (activePin) {
        map.removeLayer(activePin);
        activePin = null;
      }
    };

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (cancelled) return;
      const { lat, lng } = e.latlng;
      const rid = ++requestId;
      window.setTimeout(async () => {
        if (cancelled || rid !== requestId) return;
        try {
          const res = await fetch(
            `/api/inarisk/identify?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`,
            { cache: "no-store" }
          );
          const data = (await res.json()) as {
            attributes?: Record<string, unknown> | null;
            error?: string;
          };
          if (cancelled || rid !== requestId) return;
          if (!res.ok || data.error) throw new Error(data.error || "fail");
          const index = parseIdentifyPixel(data.attributes ?? undefined);
          const level = classifyInaRisk(index);
          if (index == null || !level) {
            clearPin();
            return;
          }
          clearPin();
          activePin = L.marker([lat, lng], {
            icon: createInaRiskPinIcon(L, level.color),
            pane: "inariskPinPane",
            interactive: true,
            keyboard: false,
            zIndexOffset: 1000,
          });
          activePin.bindPopup(buildInaRiskPopupHtml({ lat, lng, level, index }), {
            maxWidth: 300,
            autoPan: true,
          });
          activePin.addTo(map);
          activePin.openPopup();
        } catch {
          if (cancelled || rid !== requestId) return;
          clearPin();
        }
      }, 0);
    };

    map.on("click", onMapClick);
    const prevCursor = map.getContainer().style.cursor;
    map.getContainer().style.cursor = "";

    return () => {
      cancelled = true;
      map.off("click", onMapClick);
      map.getContainer().style.cursor = prevCursor;
      clearPin();
      map.removeLayer(banjirLayer);
    };
  }, [map]);
  return null;
}

function FitJatim() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(JATIM_BOUNDS, { padding: [20, 20] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface InaRiskLayerProps {
  onClose: () => void;
}

export default function InaRiskLayer({ onClose }: InaRiskLayerProps) {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => setGeojson(data))
      .catch(() => setGeojson(null));
  }, []);

  return (
    <div className="absolute inset-0 z-[400] flex flex-col">
      <style>{`.leaflet-label-kabkot{background:rgba(30,58,138,0.85)!important;color:#fff!important;border:none!important;font-size:10px!important;font-weight:600!important;padding:2px 6px!important;border-radius:4px!important;white-space:nowrap!important;box-shadow:0 1px 4px rgba(0,0,0,0.4)!important;}`}</style>
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 min-w-max">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="text-sm font-bold text-gray-900">Bahaya Banjir — BNPB inaRISK</p>
          <p className="text-[10px] text-gray-500">Klik area banjir (warna) → pin · layer_bahaya_banjir_30</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Tutup layer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <MapContainer
        center={[-7.5, 112.5]}
        zoom={8}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", zIndex: 1, background: "transparent" }}
        zoomControl={false}
        attributionControl={false}
      >
        <BanjirLayer />
        <PolygonLayer geojson={geojson} />
        <FitJatim />
      </MapContainer>

      {/* Legend bawah kiri */}
      <div className="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 px-4 py-3 space-y-1.5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Skala Bahaya Banjir</p>
        {INA_RISK_LEGEND.map((item) => (
          <div key={item.level} className="flex items-start gap-2">
            <div
              className="w-4 h-4 rounded shadow-sm flex-shrink-0 mt-0.5 border border-white"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-800 font-semibold">{item.label}</span>
              <p className="text-[9px] text-gray-400 leading-tight">{item.desc}</p>
            </div>
          </div>
        ))}
        <p className="text-[9px] text-gray-400 pt-1 border-t border-gray-100">
          Sumber: BNPB inaRISK · layer_bahaya_banjir_30
        </p>
      </div>
    </div>
  );
}
