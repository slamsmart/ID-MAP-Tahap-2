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
  // /tile3 = server-side pre-recolored PNG (3-tier + arsiran built-in).
  // Tidak perlu getImageData client-side → tidak ada CORS-taint canvas.
  return `/api/inarisk/tile3?bbox=${w},${s},${e},${n}&sizeW=${tileSizePx}&sizeH=${tileSizePx}`;
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

// NOTE: Tidak ada recolorTileToCanvas3 / renderInaRiskTileCanvas lagi.
// Server-side route /api/inarisk/tile3 SUDAH mengirim PNG yang sudah
// di-recolor ke 3-tier + arsiran SVG via sharp. Browser cukup pakai <img>
// langsung. Ini menghindari canvas tainting (CORS) yang sebelumnya
// membuat canvas kosong/transparan.

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
        // /api/inarisk/tile3 = server-side recolored PNG (3-tier + hatch).
        // Cukup <img> langsung — tidak ada canvas getImageData di client,
        // jadi tidak terpengaruh CORS-taint yang sebelumnya bikin canvas
        // kosong/transparan.
        const img = document.createElement("img");
        img.alt = "";
        img.setAttribute("role", "presentation");
        img.style.width = `${tileSizePx}px`;
        img.style.height = `${tileSizePx}px`;
        img.style.display = "block";
        img.style.opacity = "0.85";
        // Tanpa crossOrigin = anonymous → tidak ada canvas taint issue.
        img.onload = () => {
          if (cancelled) return;
          setTileState("ok");
          setTileErrorMsg(null);
          setTileLoaded((n) => n + 1);
          done(null, img);
        };
        img.onerror = () => {
          if (cancelled) return;
          setTileFailed((n) => n + 1);
          setTileState("error");
          setTileErrorMsg("Gagal memuat raster BNPB");
          done(new Error("tile load failed"), img);
        };
        if (!cancelled) setTileState("loading");
        img.src = buildProxyUrl(map, coords, tileSizePx);
        return img;
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