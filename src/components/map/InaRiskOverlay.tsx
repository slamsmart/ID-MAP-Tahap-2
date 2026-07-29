"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  INA_RISK_LEGEND,
  INDEX3_LEGEND,
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

function buildProxyUrl(
  map: L.Map,
  coords: L.Coords,
  tileSizePx: number
): string {
  const nw = map.unproject([coords.x * tileSizePx, coords.y * tileSizePx], coords.z);
  const se = map.unproject(
    [(coords.x + 1) * tileSizePx, (coords.y + 1) * tileSizePx],
    coords.z
  );
  // Round bbox ke 5 desimal → cache hit lebih tinggi antar client/viewport.
  const round = (n: number) => Number(n.toFixed(5));
  const w = round(nw.lng);
  const s = round(se.lat);
  const e = round(se.lng);
  const n = round(nw.lat);
  return `/api/inarisk/tile?bbox=${w},${s},${e},${n}&sizeW=${tileSizePx}&sizeH=${tileSizePx}`;
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

/**
 * Decode raster BNPB ke canvas dengan klasifikasi 3-tier indeks utama.
 * Pixel alpha < threshold → NoData (tetap transparan).
 * Pixel non-transparan → dipetakan ke Hijau/Kuning/Merah berdasarkan
 * hue-dominan hijau, dominasi merah/oranye, dan luminance fallback.
 */
function recolorTileToCanvas3(
  img: HTMLImageElement,
  size: number,
  alphaThreshold = 8
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(img, 0, 0, size, size);
  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, size, size);
  } catch {
    return canvas;
  }
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const a = px[i + 3];
    if (a < alphaThreshold) {
      px[i + 3] = 0;
      continue;
    }
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const greenness = g - (r + b) / 2;
    const redness = r - (g + b) / 2;
    let bucket: 0 | 1 | 2;
    if (greenness > 30) bucket = 0;
    else if (redness > 0 && lum < 0.85) bucket = 2;
    else if (lum > 0.7) bucket = 1;
    else bucket = lum < 0.55 ? 0 : lum < 0.8 ? 1 : 2;
    const target = INDEX3_LEGEND[bucket].color;
    px[i] = parseInt(target.slice(1, 3), 16);
    px[i + 1] = parseInt(target.slice(3, 5), 16);
    px[i + 2] = parseInt(target.slice(5, 7), 16);
    px[i + 3] = 210;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/** Render ulang tile BNPB ke canvas, lalu overlay pattern arsiran SVG
 *  untuk tiap kategori. Hasilnya: visual gradasi 3-warna + arsiran
 *  spasial yang color-blind friendly. */
function renderInaRiskTileCanvas(
  img: HTMLImageElement,
  size: number
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `position:relative;width:${size}px;height:${size}px;pointer-events:none;`;

  const baseRaster = document.createElement("img");
  baseRaster.alt = "";
  baseRaster.crossOrigin = "anonymous";
  baseRaster.style.cssText = `position:absolute;inset:0;width:${size}px;height:${size}px;opacity:.40;filter:saturate(.55);`;
  baseRaster.src = img.src;

  const canvasHost = document.createElement("div");
  canvasHost.style.cssText = `position:absolute;inset:0;mix-blend-mode:multiply;`;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.style.cssText = `width:${size}px;height:${size}px;display:block;`;
  canvasHost.appendChild(canvas);

  const hatchHost = document.createElement("div");
  hatchHost.style.cssText = `position:absolute;inset:0;mix-blend-mode:overlay;opacity:.55;pointer-events:none;`;
  INDEX3_LEGEND.forEach((lvl, idx) => {
    const hatch = document.createElement("div");
    hatch.style.cssText = `position:absolute;inset:0;background-image:${lvl.hatch};background-size:${10 + idx * 2}px ${10 + idx * 2}px;mix-blend-mode:overlay;opacity:.42;`;
    hatchHost.appendChild(hatch);
  });

  wrapper.appendChild(baseRaster);
  wrapper.appendChild(canvasHost);
  wrapper.appendChild(hatchHost);

  // Tunggu raster load → re-color ke canvas
  const doRecolor = () => {
    try {
      const colored = recolorTileToCanvas3(baseRaster, size);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(colored, 0, 0);
      }
    } catch {
      // Best-effort
    }
  };
  if (baseRaster.complete && baseRaster.naturalWidth > 0) {
    doRecolor();
  } else {
    baseRaster.onload = doRecolor;
  }
  return wrapper;
}

/** inaRISK bahaya banjir (nasional) + pin click identify + pesisir poly */
export default function InaRiskOverlay({ fitOnLoad = false }: { fitOnLoad?: boolean }) {
  const map = useMap();
  const [ready, setReady] = useState(false);
  const [tileState, setTileState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [tileErrorMsg, setTileErrorMsg] = useState<string | null>(null);
  const [tileLoaded, setTileLoaded] = useState(0);
  const [tileFailed, setTileFailed] = useState(0);

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
        const tileSizePx = 256;
        const wrapper = document.createElement("div");
        wrapper.style.width = `${tileSizePx}px`;
        wrapper.style.height = `${tileSizePx}px`;
        wrapper.style.position = "relative";
        wrapper.style.pointerEvents = "none";

        const img = document.createElement("img");
        img.alt = "";
        img.setAttribute("role", "presentation");
        img.style.width = `${tileSizePx}px`;
        img.style.height = `${tileSizePx}px`;
        img.style.display = "block";
        img.crossOrigin = "anonymous";

        const url = buildProxyUrl(map, coords, tileSizePx);
        img.onload = () => {
          if (cancelled) return;
          setTileState("ok");
          setTileErrorMsg(null);
          setTileLoaded((n) => n + 1);
          // Replace img dengan canvas wrapper (recolor 3-tier + arsiran)
          try {
            const canvasWrap = renderInaRiskTileCanvas(img, tileSizePx);
            if (wrapper.parentNode) {
              wrapper.parentNode.replaceChild(canvasWrap, wrapper);
            }
            done(null, canvasWrap);
          } catch {
            done(null, img);
          }
        };
        img.onerror = () => {
          if (cancelled) return;
          setTileFailed((n) => n + 1);
          setTileState("error");
          setTileErrorMsg("Gagal memuat raster BNPB");
          done(new Error("tile load failed"), img);
        };
        if (!cancelled) setTileState("loading");
        img.src = url;
        wrapper.appendChild(img);
        return wrapper;
      },
    });
    const banjir = new (BanjirGrid as unknown as new (opts?: L.GridLayerOptions) => L.GridLayer)({
      opacity: 0.85,
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
            // Palet standar BNPB inaRISK (kuning → oranye → oranye tua)
            // outline oranye-tua #ff6b0c, fill oranye #ffa916 dengan opacity rendah
            // supaya konsisten dengan raster BNPB tanpa menutupi detail tile.
            color: "#ff6b0c",
            weight: 1.5,
            fillColor: "#ffa916",
            fillOpacity: 0.18,
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
  const statusText =
    tileState === "loading"
      ? "memuat…"
      : tileState === "error"
      ? "gagal"
      : tileState === "ok" || ready
      ? "aktif"
      : "…";
  const statusColor =
    tileState === "error"
      ? "text-red-700"
      : tileState === "ok" || ready
      ? "text-emerald-700"
      : "text-amber-700";
  const fontStack = { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" };
  return (
    <>
      {createPortal(
        <div
          className="absolute bottom-4 left-4 z-[450] pointer-events-none bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-3 py-2.5 max-w-[240px]"
          style={fontStack}
        >
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
            Gradasi Indeks Utama · BNPB inaRISK
          </p>
          <ul className="space-y-1 mb-2">
            {INDEX3_LEGEND.map((item) => (
              <li
                key={item.level}
                className="flex items-center gap-2 text-[10px] text-gray-800"
                title={item.desc}
              >
                <span
                  aria-hidden
                  className="flex-shrink-0 rounded-sm"
                  style={{
                    width: 18,
                    height: 14,
                    // Background dasar = warna kategori; layer arsiran
                    // SVG pattern (hatch) overlay di atasnya dengan
                    // blend-mode multiply → visualnya jelas "hijau/kuning/
                    // merah dengan pola arsiran spasial".
                    backgroundColor: item.color,
                    backgroundImage: item.hatch,
                    backgroundSize: "10px 10px",
                    border: "1px solid rgba(0,0,0,0.32)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.85)",
                  }}
                />
                <span className="font-bold leading-none w-3">
                  {item.shortLabel}
                </span>
                <span className="leading-none font-semibold">{item.label}</span>
                <span className="leading-none text-[9px] text-gray-500 ml-auto">
                  {item.range[0].toFixed(1)}–{item.range[1].toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1 pt-1.5 border-t border-gray-200">
            Detail 5-Tingkat BNPB
          </p>
          <ul className="space-y-1">
            {INA_RISK_LEGEND.map((item) => (
              <li
                key={item.level}
                className="flex items-center gap-2 text-[10px] text-gray-800"
              >
                <span
                  aria-hidden
                  className="flex-shrink-0 rounded-sm"
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: item.color,
                    // Border tipis + ring halus → chip kuning pucat tetap
                    // punya kontras di background putih / device terang.
                    border: "1px solid rgba(0,0,0,0.18)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.85)",
                  }}
                />
                <span className="font-semibold leading-none">
                  {item.level}
                </span>
                <span className="leading-none">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>,
        container
      )}
      {createPortal(
        <div
          className="absolute bottom-4 right-4 z-[450] pointer-events-none bg-white/95 rounded-xl shadow border border-gray-100 px-3 py-2 max-w-[220px]"
          style={fontStack}
        >
          <p className={`text-[10px] font-bold ${statusColor}`}>
            ⚠️ BNPB inaRISK {statusText}
          </p>
          {tileState === "error" && (
            <p className="text-[9px] text-red-600/80 leading-snug mt-0.5">
              {tileErrorMsg ?? "Raster BNPB tidak dapat dimuat."} Coba zoom in/out.
            </p>
          )}
          {tileState === "ok" && (tileLoaded > 0 || tileFailed > 0) && (
            <p className="text-[9px] text-gray-500 leading-snug mt-0.5">
              Tile {tileLoaded} ok{tileFailed > 0 ? `, ${tileFailed} gagal` : ""}
            </p>
          )}
        </div>,
        container
      )}
    </>
  );
}