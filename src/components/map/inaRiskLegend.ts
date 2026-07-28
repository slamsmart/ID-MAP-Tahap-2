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

/** Skala Bahaya Banjir (digabungkan) */
export function createInaRiskLegendHtml(): string {
  return `
    <div class="flex flex-col gap-2 text-xs bg-white/95 p-3 rounded-xl border border-gray-200 shadow">
      <div class="font-bold text-red-700 flex items-center gap-2">
        <span>⚠️</span>
        <span>Skala Bahaya Banjir</span>
      </div>
      <div class="flex flex-wrap gap-3">
        ${INA_RISK_LEGEND.map((l) => 
          `<div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded border" style="background:${l.color}"></span>
            <span>${l.label}</span>
          </div>`
        ).join('')}
      </div>
    </div>
  `;
}