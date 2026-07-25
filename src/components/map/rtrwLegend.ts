/**
 * RTRW Pola Ruang Darat — legend colors chosen to avoid clashing with:
 * - MHI: #1a9641 / #f5c542 / #d7191c
 * - PRL zones: bright teal/pink/blue multi-palette
 * - Abrasi: orange dots
 * - BNPB: red risk scale
 */
export type RtrwLegendItem = {
  name: string;
  color: string;
  short?: string;
};

/** Stable display palette (not raw KML aabbggrr). */
export const RTRW_ZONE_COLORS: Record<string, string> = {
  "Kawasan yang Memberikan Perlindungan terhadap Kawasan Bawahannya": "#1e3a5f",
  "Kawasan Perlindungan Setempat": "#1e40af",
  "Kawasan Ekosistem Mangrove": "#5b21b6",
  "Kawasan Konservasi": "#6d28d9",
  "Kawasan Pencadangan Konservasi di Laut": "#0e7490",
  "Kawasan Hutan Produksi": "#854d0e",
  "Kawasan Pertanian": "#9a3412",
  "Kawasan Perkebunan Rakyat": "#c2410c",
  "Kawasan Permukiman": "#7c3aed",
  "Kawasan Peruntukan Industri": "#9f1239",
  "Kawasan Transportasi": "#334155",
  "Kawasan Transportasi/Kawasan Peruntukan Industri": "#475569",
  "Kawasan Perikanan": "#0369a1",
  "Kawasan Ekosistem Mangrove/Kawasan Perikanan": "#4338ca",
  "Kawasan Pertambangan dan Energi": "#0f172a",
  "Kawasan Pertahanan dan Keamanan": "#701a75",
  "Kawasan Pariwisata": "#a21caf",
  "Kawasan Pergaraman": "#a8a29e",
  "Kawasan Pembuangan Hasil Pengerukan di Laut": "#78716c",
  "Badan Air": "#1d4ed8",
};

const FALLBACK = [
  "#312e81",
  "#4c1d95",
  "#9f1239",
  "#9a3412",
  "#365314",
  "#134e4a",
  "#1e3a8a",
  "#0f172a",
  "#57534e",
];

export function colorForRtrwZone(name: string): string {
  if (RTRW_ZONE_COLORS[name]) return RTRW_ZONE_COLORS[name];
  for (const [k, v] of Object.entries(RTRW_ZONE_COLORS)) {
    if (name.includes(k) || k.includes(name)) return v;
  }
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % 997;
  return FALLBACK[h % FALLBACK.length];
}

/** Compact short labels for legend UI */
export function shortRtrwName(name: string): string {
  return name
    .replace(/^Kawasan\s+/i, "")
    .replace(/yang Memberikan Perlindungan terhadap Kawasan Bawahannya/i, "Lindung Bawahan")
    .replace(/Pencadangan Konservasi di Laut/i, "Konservasi Laut")
    .replace(/Pertahanan dan Keamanan/i, "Hankam")
    .replace(/Peruntukan Industri/i, "Industri")
    .replace(/Pembuangan Hasil Pengerukan di Laut/i, "Dumping Laut")
    .replace(/Transportasi\/Kawasan Peruntukan Industri/i, "Transportasi/Industri")
    .replace(/Ekosistem Mangrove\/Kawasan Perikanan/i, "Mangrove/Perikanan");
}

export const RTRW_LEGEND: RtrwLegendItem[] = Object.entries(RTRW_ZONE_COLORS).map(
  ([name, color]) => ({ name, color, short: shortRtrwName(name) })
);
