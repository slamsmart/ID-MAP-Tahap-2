"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import JSZip from "jszip";
import { X, Layers, Loader2, Map as MapIcon, AlertTriangle } from "lucide-react";

type Status = "loading" | "ready" | "empty" | "error";

const LABELS: Record<string, string> = {
  SHAPE: "Bentuk Geometri",
  NAMOBJ: "Nama Objek",
  ORDE1: "Orde",
  KODKWS: "Kode",
  JNSRPR: "Jenis",
  WKLPR: "Wilayah",
  WKMHA: "Wilayah Minimal",
  DLKP: "Dalam Kegiatan",
  TSS: "TSS",
  HANKAM: "Hankam",
  MIGAS: "Migas",
  WPMB: "WPMB",
  APKI: "APKI",
  DLPI: "DLPI",
  PSSA: "PSSA",
  MBL: "MBL",
  PKBL: "PKBL",
  KS: "KS",
  REMARK: "Keterangan",
  LUASHA: "Luas (Ha)",
};

const STYLE = {
  color: "#10b981",
  weight: 1,
  fillColor: "#10b981",
  fillOpacity: 0.25,
};

async function readKmlText(url: string): Promise<string> {
  const isKmz = /\.kmz(\?.*)?$/i.test(url);
  if (!isKmz) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }
  const buf = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.arrayBuffer();
  });
  const zip = await JSZip.loadAsync(buf);
  const entry =
    zip.file("doc.kml") ||
    Object.values(zip.files).find((f) => !f.dir && /\.kml$/i.test(f.name));
  if (!entry) throw new Error("Tidak ada doc.kml di dalam .kmz");
  return entry.async("string");
}

function textOf(el: Element, tag: string): string {
  const e = el.getElementsByTagName(tag)[0];
  return e ? (e.textContent || "").trim() : "";
}

function readCoords(el: Element): L.LatLng[] {
  const c = el.getElementsByTagName("coordinates")[0];
  if (!c) return [];
  const text = c.textContent || "";
  const out: L.LatLng[] = [];
  for (const chunk of text.split(/[\s]+/)) {
    const p = chunk.trim();
    if (!p) continue;
    const parts = p.split(",");
    if (parts.length < 2) continue;
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[0]);
    if (!isNaN(lat) && !isNaN(lng)) out.push(L.latLng(lat, lng));
  }
  return out;
}

function parseTable(html: string): Record<string, string> {
  const rows: Record<string, string> = {};
  const re = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tds = m[1].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
    if (tds && tds.length >= 2) {
      const key = tds[0].replace(/<[^>]+>/g, "").trim();
      const val = tds[1].replace(/<[^>]+>/g, "").trim();
      if (key) rows[key] = val;
    }
  }
  return rows;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPopupHtml(
  name: string,
  rows: Record<string, string>,
  center?: L.LatLng
): string {
  const label = (k: string) => LABELS[k] || k;
  const kode = rows["KODKWS"];
  const jenis = rows["JNSRPR"];
  const shown = new Set(["SHAPE", "KODKWS", "JNSRPR", "NAMOBJ"]);
  const extras = Object.entries(rows).filter(([k]) => !shown.has(k));
  const coordRow = center
    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0">
         <div style="font-size:9px;color:#16a34a;font-weight:700;text-transform:uppercase">Koordinat</div>
         <div style="font-size:11px;font-weight:700;color:#15803d">${center.lat.toFixed(
           5
         )}, ${center.lng.toFixed(5)}</div>
       </div>`
    : "";
  const rowHtml = ([k, v]: [string, string]) =>
    `<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1px solid #f0f0f0">
       <span style="color:#64748b;font-size:11px">${esc(label(k))}</span>
       <span style="color:#0f172a;font-size:11px;font-weight:600;text-align:right">${esc(v)}</span>
     </div>`;

  return `<div style="font-family:system-ui,sans-serif;min-width:240px;max-width:300px">
    <div style="display:inline-block;background:#10b981;color:#fff;font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:99px;margin-bottom:6px">Pola Ruang Pemanfaatan</div>
    <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:2px">${esc(name)}</div>
    ${
      kode
        ? `<div style="margin:6px 0;padding:6px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
             <div style="font-size:9px;color:#16a34a;font-weight:700;text-transform:uppercase">Kode</div>
             <div style="font-size:13px;font-weight:800;color:#15803d">${esc(kode)}</div></div>`
        : ""
    }
    ${
      jenis
        ? `<div style="margin:4px 0 8px;padding:6px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
             <div style="font-size:9px;color:#16a34a;font-weight:700;text-transform:uppercase">Jenis</div>
             <div style="font-size:12px;font-weight:700;color:#15803d">${esc(jenis)}</div></div>`
        : ""
    }
    <div style="margin-top:6px">${extras.map(rowHtml).join("")}</div>
    ${coordRow}
  </div>`;
}

function KmlLoader({
  url,
  onStatus,
}: {
  url: string;
  onStatus: (s: Status, count: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    onStatus("loading", 0);

    readKmlText(url)
      .then((text) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(text, "text/xml");
        const placemarks = Array.from(doc.getElementsByTagName("Placemark"));
        const group = L.featureGroup();
        let count = 0;

        for (const pm of placemarks) {
          const name = textOf(pm, "name");
          const rows = parseTable(textOf(pm, "description"));
          const polygons = Array.from(pm.getElementsByTagName("Polygon"));
          for (const poly of polygons) {
            const rings: L.LatLng[][] = [];
            const outer = poly.getElementsByTagName("outerBoundaryIs")[0];
            if (outer) {
              const o = readCoords(outer);
              if (o.length) rings.push(o);
            }
            const inners = Array.from(poly.getElementsByTagName("innerBoundaryIs"));
            for (const inner of inners) {
              const h = readCoords(inner);
              if (h.length) rings.push(h);
            }
            if (!rings.length) continue;
            const layer = L.polygon(rings, STYLE);
            const center = layer.getBounds().getCenter();
            layer.bindPopup(buildPopupHtml(name, rows, center), { maxWidth: 320 });
            layer.addTo(group);
            count += 1;
          }
        }

        if (count === 0) {
          onStatus("empty", 0);
          return;
        }
        group.addTo(map);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
        onStatus("ready", count);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("KML load failed:", err);
          onStatus("error", 0);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return null;
}

export default function KmlLayer({
  url,
  title = "Layer KML",
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [count, setCount] = useState(0);

  return (
    <div className="absolute inset-0 z-[400] flex flex-col">
      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-white/97 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 max-w-[calc(100vw-32px)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
            <p className="text-[10px] text-gray-500">
              {status === "ready"
                ? `${count.toLocaleString("id-ID")} poligon · Jawa Timur`
                : status === "loading"
                ? "Memuat data spasial…"
                : status === "empty"
                ? "Layer kosong (tidak ada geometri)"
                : "Gagal memuat layer"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ml-auto"
          aria-label="Tutup layer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Map (Canvas renderer = cepat untuk banyak poligon) */}
      <MapContainer
        center={[-7.5, 112.5]}
        zoom={9}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl
        preferCanvas
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={19}
        />
        <KmlLoader url={url} onStatus={(s, c) => { setStatus(s); setCount(c); }} />
      </MapContainer>

      {/* Status overlay */}
      {status !== "ready" && (
        <div className="absolute inset-0 z-[550] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-[#0F2E2A]/80 backdrop-blur px-6 py-5 rounded-2xl shadow-xl border border-white/10">
            {status === "loading" && (
              <>
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                <p className="text-emerald-100/80 text-xs font-medium">Memuat layer KML…</p>
              </>
            )}
            {status === "empty" && (
              <>
                <MapIcon className="h-8 w-8 text-amber-400" />
                <p className="text-amber-100/90 text-xs font-medium text-center max-w-[240px]">
                  File ini tidak berisi geometri (kosong). Ganti dengan KML/KMZ yang memuat poligon.
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <p className="text-red-100/90 text-xs font-medium text-center max-w-[240px]">
                  Gagal memuat file. Pastikan format KML/KMZ valid dan dapat diakses.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
