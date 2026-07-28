"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  INA_RISK_LEGEND,
  INARISK_BANJIR_MAPSERVER,
  INARISK_BANJIR_SERVICE_LABEL,
  buildInaRiskPopupHtml,
  classifyInaRisk,
  createInaRiskPinIcon,
  parseIdentifyPixel,
} from "./inaRiskLegend";

const GEOJSON_URL = "/data/east-java.geojson";

const PESISIR_NAMES = new Set([
  "Kota Surabaya", "Surabaya", "Kota Probolinggo", "Probolinggo",
  "Kota Pasuruan", "Pasuruan", "Kabupaten Gresik", "Gresik",
  "Kabupaten Sidoarjo", "Sidoarjo", "Kabupaten Lamongan", "Lamongan",
  "Kabupaten Tuban", "Tuban", "Kabupaten Situbondo", "Situbondo",
  "Kabupaten Banyuwangi", "Banyuwangi", "Kabupaten Probolinggo",
  "Kabupaten Pasuruan", "Kabupaten Lumajang", "Lumajang",
  "Kabupaten Jember", "Jember", "Kabupaten Malang", "Malang",
  "Kabupaten Trenggalek", "Trenggalek", "Kabupaten Tulungagung", "Tulungagung",
  "Kabupaten Blitar", "Blitar", "Kabupaten Pacitan", "Pacitan",
  "Kabupaten Bangkalan", "Bangkalan", "Kabupaten Sampang", "Sampang",
  "Kabupaten Pamekasan", "Pamekasan", "Kabupaten Sumenep", "Sumenep",
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

function buildExportUrl(
  map: L.Map,
  coords: L.Coords,
  tileSizePx: number
): string {
  const nw = map.unproject([coords.x * tileSizePx, coords.y * tileSizePx], coords.z);
  const se = map.unproject(
    [(coords.x + 1) * tileSizePx, (coords.y + 1) * tileSizePx],
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
  return `${INARISK_BANJIR_MAPSERVER}?${params.toString()}`;
}

type ClaimMap = L.Map & { __zoneClickClaimed?: number };

function ensurePane(map: L.Map, name: string, zIndex: string) {
  if (!map.getPane(name)) map.createPane(name);
  const pane = map.getPane(name);
  if (pane) pane.style.zIndex = zIndex;
}

function isZoneClaimed(map: L.Map, windowMs = 100): boolean {
  const claimed = (map as ClaimMap).__zoneClickClaimed || 0;
  return Date.now() - claimed < windowMs;
}

async function fetchIdentify(lat: number, lng: number) {
  const url = `/api/inarisk/identify?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    ok?: boolean;
    attributes?: Record<string, unknown> | null;
    error?: string;
  };
  if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/** inaRISK bahaya banjir (nasional) + pin click identify + pesisir poly */
export default function InaRiskOverlay({ fitOnLoad = false }: { fitOnLoad?: boolean }) {
  const map = useMap();
  const [ready, setReady] = useState(false);
  const [tileOk, setTileOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const layers: L.Layer[] = [];
    let activePin: L.Marker | null = null;
    let requestId = 0;

    ensurePane(map, "inariskPinPane", "630");

    const clearPin = () => {
      if (activePin) {
        map.removeLayer(activePin);
        activePin = null;
      }
    };

    const BanjirGrid = (L.GridLayer as unknown as {
      extend: (opts: object) => new () => L.GridLayer;
    }).extend({
      createTile(coords: L.Coords, done: (err: Error | null, tile: HTMLElement) => void) {
        const img = document.createElement("img");
        const tileSizePx = 256;
        img.alt = "";
        img.setAttribute("role", "presentation");
        img.style.opacity = "0.7";
        img.style.width = `${tileSizePx}px`;
        img.style.height = `${tileSizePx}px`;
        img.onload = () => {
          if (!cancelled) setTileOk(true);
          done(null, img);
        };
        img.onerror = () => {
          done(new Error("tile load failed"), img);
        };
        img.src = buildExportUrl(map, coords, tileSizePx);
        return img;
      },
    });
    const banjir = new (BanjirGrid as unknown as new (opts?: L.GridLayerOptions) => L.GridLayer)({
      opacity: 0.75,
      updateWhenIdle: true,
      keepBuffer: 1,
    });
    banjir.addTo(map);
    layers.push(banjir);

    /** Pin only on flood raster pixels; yield to PRL/RTRW zone claims. */
    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (cancelled) return;
      const { lat, lng } = e.latlng;
      const rid = ++requestId;

      // Defer so PRL/RTRW can claim the click first (same map event).
      window.setTimeout(async () => {
        if (cancelled || rid !== requestId) return;
        if (isZoneClaimed(map)) {
          clearPin();
          return;
        }

        try {
          const data = await fetchIdentify(lat, lng);
          if (cancelled || rid !== requestId) return;
          if (isZoneClaimed(map)) {
            clearPin();
            return;
          }

          const index = parseIdentifyPixel(data.attributes ?? undefined);
          const level = classifyInaRisk(index);
          // NoData / luar cakupan banjir → jangan pin (biar PRL/laut/dll)
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
            className: "inarisk-popup",
          });
          activePin.addTo(map);
          activePin.openPopup();
        } catch {
          // Silent: pin hanya untuk area berdata; error jaringan tidak ganggu layer lain
          if (cancelled || rid !== requestId) return;
          clearPin();
        }
      }, 0);
    };

    map.on("click", onMapClick);
    const container = map.getContainer();
    const prevCursor = container.style.cursor;
    container.style.cursor = "";

    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson) => {
        if (cancelled) return;
        const poly = L.geoJSON(geojson, {
          filter: (feature) => isPesisir(feature.properties ?? {}),
          style: {
            color: "#0ea5e9",
            weight: 1.5,
            fillColor: "#0ea5e9",
            fillOpacity: 0.12,
          },
          interactive: false,
        });
        poly.addTo(map);
        layers.push(poly);
        setReady(true);
        if (fitOnLoad) {
          map.fitBounds(
            [
              [-8.9, 109.8],
              [-6.9, 115.5],
            ],
            { padding: [20, 20] }
          );
        }
      })
      .catch(() => setReady(true));

    return () => {
      cancelled = true;
      map.off("click", onMapClick);
      container.style.cursor = prevCursor;
      clearPin();
      layers.forEach((l) => map.removeLayer(l));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const container = map.getContainer();
  if (typeof document === "undefined" || !container) return null;
  return createPortal(
    <div className="absolute bottom-4 right-4 z-[450] pointer-events-none bg-white/95 rounded-xl shadow border border-gray-100 px-3 py-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <p className="text-[10px] font-bold text-red-700">⚠️ BNPB inaRISK {ready || tileOk ? "aktif" : "…"}</p>
    </div>,
    container
  );
}
