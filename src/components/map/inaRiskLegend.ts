export type InaRiskLevel = {
  level: string;
  label: string;
  color: string;
  desc: string;
};

/** Warna diselaraskan stretch BNPB layer_bahaya_banjir_30 (hijau → kuning → oranye). */
export const INA_RISK_LEGEND: InaRiskLevel[] = [
  { level: "1", label: "Rendah", color: "#167c19", desc: "Bahaya banjir rendah" },
  { level: "2", label: "Menengah Rendah", color: "#8cc41e", desc: "Bahaya agak rendah" },
  { level: "3", label: "Menengah", color: "#f0fc2a", desc: "Bahaya sedang" },
  { level: "4", label: "Menengah Tinggi", color: "#ffa916", desc: "Bahaya cukup tinggi" },
  { level: "5", label: "Tinggi", color: "#ff6b0c", desc: "Bahaya sangat tinggi" },
];

/**
 * Gradasi 3 tingkat indeks utama — re-classification indeks pixel 0–1
 * ke tiga kategori visual yang lebih gampang dibaca untuk pengguna awam.
 *
 * - Hijau = Rendah (v < 0.4): danger zone lemah, bisa diabaikan untuk rencana dasar.
 * - Kuning = Sedang (0.4 ≤ v < 0.8): butuh mitigasi struktural/non-struktural.
 * - Merah = Tinggi (v ≥ 0.8): area prioritas, wajib ada rencana kontingensi.
 *
 * `hatch` adalah dataURI SVG pattern (encoded %23 untuk #) untuk arsiran
 * spasial — dipakai di canvas overlay / chip legend. Pola berbeda per level
 * supaya area dapat dibedakan meski user buta warna (color-blind safe).
 */
export type InaRiskIndex3 = {
  level: "1" | "2" | "3";
  label: string;
  shortLabel: string;
  color: string;
  hatch: string;
  desc: string;
  range: [number, number];
};

function svgHatch(hex: string, angleDeg: number, spacing: number, strokeW: number): string {
  // pattern 24x24 tile; garis diagonal repetition untuk arsiran area besar
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${spacing}' height='${spacing}' viewBox='0 0 ${spacing} ${spacing}'><path d='M0 ${spacing / 2}L${spacing} ${-spacing / 2}M${-spacing / 2} ${spacing}L${spacing} ${spacing + spacing / 2}' stroke='${hex}' stroke-width='${strokeW}' fill='none'/></svg>`;
  const rotated = `<svg xmlns='http://www.w3.org/2000/svg' width='${spacing}' height='${spacing}' viewBox='0 0 ${spacing} ${spacing}'><g transform='rotate(${angleDeg} ${spacing / 2} ${spacing / 2})'>${svg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")}</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(rotated)}")`;
}

export const INDEX3_LEGEND: InaRiskIndex3[] = [
  {
    level: "1",
    label: "Rendah",
    shortLabel: "R",
    color: "#16a34a",
    hatch: svgHatch("#15803d", 0, 10, 1.2),
    desc: "Bahaya rendah — indeks < 0.4",
    range: [0, 0.4],
  },
  {
    level: "2",
    label: "Sedang",
    shortLabel: "S",
    color: "#facc15",
    hatch: svgHatch("#a16207", 45, 10, 1.2),
    desc: "Bahaya sedang — indeks 0.4–0.8",
    range: [0.4, 0.8],
  },
  {
    level: "3",
    label: "Tinggi",
    shortLabel: "T",
    color: "#dc2626",
    hatch: svgHatch("#7f1d1d", 135, 8, 1.4),
    desc: "Bahaya tinggi — indeks ≥ 0.8",
    range: [0.8, 1],
  },
];

/** Klasifikasi pixel 0–1 ke 3 tingkat indeks utama. */
export function classifyInaRiskIndex3(value: number | null): InaRiskIndex3 | null {
  if (value == null || Number.isNaN(value)) return null;
  const v = Math.max(0, Math.min(1, value));
  if (v < INDEX3_LEGEND[0].range[1]) return INDEX3_LEGEND[0];
  if (v < INDEX3_LEGEND[1].range[1]) return INDEX3_LEGEND[1];
  return INDEX3_LEGEND[2];
}

/**
 * JBTBPJ = Jabodetabekpunjur saja (fullExtent ~106.7–107.4E).
 * Untuk peta Jatim/nasional pakai layer_bahaya_banjir_30.
 */
export const INARISK_BANJIR_SERVICE_PATH =
  "inarisk/layer_bahaya_banjir_30/MapServer";

export const INARISK_BANJIR_MAPSERVER =
  `https://gis.bnpb.go.id/server/rest/services/${INARISK_BANJIR_SERVICE_PATH}/export`;

export const INARISK_BANJIR_IDENTIFY =
  `https://gis.bnpb.go.id/server/rest/services/${INARISK_BANJIR_SERVICE_PATH}/identify`;

export const INARISK_BANJIR_SERVICE_LABEL = "layer_bahaya_banjir_30 (nasional)";

/** Klasifikasi indeks pixel 0–1 (Stretch.Pixel Value BNPB). */
export function classifyInaRisk(value: number | null): InaRiskLevel | null {
  if (value == null || Number.isNaN(value)) return null;
  const v = Math.max(0, Math.min(1, value));
  if (v < 0.2) return INA_RISK_LEGEND[0];
  if (v < 0.4) return INA_RISK_LEGEND[1];
  if (v < 0.6) return INA_RISK_LEGEND[2];
  if (v < 0.8) return INA_RISK_LEGEND[3];
  return INA_RISK_LEGEND[4];
}

export function parseIdentifyPixel(attrs: Record<string, unknown> | undefined): number | null {
  if (!attrs) return null;
  const raw =
    attrs["Stretch.Pixel Value"] ??
    attrs["Pixel Value"] ??
    attrs["value"] ??
    attrs["VALUE"];
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || /^nodata$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function buildInaRiskPopupHtml(opts: {
  lat: number;
  lng: number;
  level: InaRiskLevel | null;
  index: number | null;
  loading?: boolean;
  error?: string;
}): string {
  const { lat, lng, level, index, loading, error } = opts;
  const coord = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (loading) {
    return `<div style="font-family:Arial,Helvetica,sans-serif;min-width:200px;max-width:280px;padding:2px 0">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#b91c1c;margin-bottom:6px">BNPB inaRISK</div>
      <div style="font-size:12px;color:#6b7280">Mengambil data banjir…</div>
      <div style="margin-top:8px;font-size:10px;color:#9ca3af">${coord}</div>
    </div>`;
  }
  if (error) {
    return `<div style="font-family:Arial,Helvetica,sans-serif;min-width:200px;max-width:280px;padding:2px 0">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#b91c1c;margin-bottom:6px">BNPB inaRISK</div>
      <div style="font-size:12px;color:#dc2626">${error}</div>
      <div style="margin-top:8px;font-size:10px;color:#9ca3af">${coord}</div>
    </div>`;
  }
  if (!level || index == null) {
    return `<div style="font-family:Arial,Helvetica,sans-serif;min-width:200px;max-width:280px;padding:2px 0">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:#b91c1c;margin-bottom:6px">BNPB inaRISK</div>
      <div style="font-weight:700;font-size:13px;color:#374151">Tidak ada data banjir</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">Lokasi di luar cakupan raster / NoData</div>
      <div style="margin-top:8px;font-size:10px;color:#9ca3af">${coord}</div>
    </div>`;
  }
  const pct = Math.round(index * 100);
  return `<div style="font-family:Arial,Helvetica,sans-serif;min-width:210px;max-width:280px;padding:2px 0">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="width:14px;height:14px;border-radius:3px;background:${level.color};border:1px solid rgba(0,0,0,.12);display:inline-block;flex-shrink:0;box-shadow:0 0 0 1px #fff"></span>
      <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:#b91c1c;letter-spacing:.04em">BNPB inaRISK</span>
    </div>
    <div style="font-weight:800;font-size:14px;color:#111827;line-height:1.25">Bahaya Banjir: ${level.label}</div>
    <div style="font-size:11px;color:#4b5563;margin-top:4px">${level.desc}</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:700;color:#fff;background:${level.color};padding:3px 8px;border-radius:999px;border:1px solid rgba(0,0,0,.08)">Level ${level.level}</span>
      <span style="font-size:10px;font-weight:600;color:#374151;background:#f3f4f6;padding:3px 8px;border-radius:999px">Indeks ${pct}%</span>
    </div>
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid #f3f4f6;font-size:10px;color:#9ca3af">
      ${coord}<br/>Sumber: gis.bnpb.go.id · ${INARISK_BANJIR_SERVICE_LABEL}
    </div>
  </div>`;
}

export function createInaRiskPinIcon(
  L: typeof import("leaflet"),
  color: string
): import("leaflet").DivIcon {
  return L.divIcon({
    className: "inarisk-pin",
    html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.4);transform:rotate(-45deg)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20],
  });
}
