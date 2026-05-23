/**
 * Data Mangrove Nasional Indonesia 2025
 * Sumber: PMN (Program Mangrove Nasional), KKMD (Kelompok Kerja Mangrove Daerah),
 *         BRGMN (Badan Restorasi Gambut dan Mangrove Nasional)
 */

export interface ProvinsiMangrove {
  provinsi: string;
  pulau: string;
  luasTotal: number;      // hektar
  luasDegradasi: number;  // hektar
  targetRestorasi: number;// hektar (BRGMN 2023-2024)
  realisasi: number;      // hektar (realisasi tanam)
  persenRealisasi: number;// %
  kondisi: "baik" | "sedang" | "kritis";
  kkmdAktif: boolean;
}

export interface ProgramRestorasi {
  nama: string;
  sumber: string;
  targetHektar: number;
  realisasiHektar: number;
  periodeAwal: number;
  periodeAkhir: number;
  status: "berjalan" | "selesai" | "rencana";
  keterangan: string;
}

export interface AncamanMangrove {
  jenis: string;
  tingkat: "tinggi" | "sedang" | "rendah";
  provinsiTerdampak: string[];
  luasTerdampak: number; // hektar/tahun
}

// ─── Data per Provinsi ────────────────────────────────────────────────────────

export const DATA_PROVINSI: ProvinsiMangrove[] = [
  // Papua & Maluku (terluas)
  { provinsi: "Papua", pulau: "Papua", luasTotal: 3_007_000, luasDegradasi: 420_000, targetRestorasi: 150_000, realisasi: 89_400, persenRealisasi: 59.6, kondisi: "baik", kkmdAktif: true },
  { provinsi: "Papua Barat", pulau: "Papua", luasTotal: 1_203_000, luasDegradasi: 180_000, targetRestorasi: 75_000, realisasi: 41_200, persenRealisasi: 54.9, kondisi: "baik", kkmdAktif: true },
  { provinsi: "Maluku", pulau: "Maluku", luasTotal: 360_000, luasDegradasi: 82_000, targetRestorasi: 35_000, realisasi: 18_700, persenRealisasi: 53.4, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Maluku Utara", pulau: "Maluku", luasTotal: 219_000, luasDegradasi: 54_000, targetRestorasi: 25_000, realisasi: 11_300, persenRealisasi: 45.2, kondisi: "sedang", kkmdAktif: true },

  // Kalimantan
  { provinsi: "Kalimantan Timur", pulau: "Kalimantan", luasTotal: 489_000, luasDegradasi: 127_000, targetRestorasi: 60_000, realisasi: 28_500, persenRealisasi: 47.5, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Kalimantan Barat", pulau: "Kalimantan", luasTotal: 348_000, luasDegradasi: 98_000, targetRestorasi: 45_000, realisasi: 19_800, persenRealisasi: 44.0, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Kalimantan Utara", pulau: "Kalimantan", luasTotal: 274_000, luasDegradasi: 61_000, targetRestorasi: 30_000, realisasi: 14_200, persenRealisasi: 47.3, kondisi: "sedang", kkmdAktif: false },
  { provinsi: "Kalimantan Selatan", pulau: "Kalimantan", luasTotal: 189_000, luasDegradasi: 72_000, targetRestorasi: 38_000, realisasi: 15_400, persenRealisasi: 40.5, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Kalimantan Tengah", pulau: "Kalimantan", luasTotal: 156_000, luasDegradasi: 58_000, targetRestorasi: 28_000, realisasi: 9_800, persenRealisasi: 35.0, kondisi: "kritis", kkmdAktif: true },

  // Sumatera
  { provinsi: "Riau", pulau: "Sumatera", luasTotal: 425_000, luasDegradasi: 165_000, targetRestorasi: 80_000, realisasi: 27_300, persenRealisasi: 34.1, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Kepulauan Riau", pulau: "Sumatera", luasTotal: 98_000, luasDegradasi: 38_000, targetRestorasi: 20_000, realisasi: 8_100, persenRealisasi: 40.5, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Sumatera Selatan", pulau: "Sumatera", luasTotal: 276_000, luasDegradasi: 134_000, targetRestorasi: 65_000, realisasi: 21_600, persenRealisasi: 33.2, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Sumatera Utara", pulau: "Sumatera", luasTotal: 187_000, luasDegradasi: 79_000, targetRestorasi: 40_000, realisasi: 14_900, persenRealisasi: 37.3, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Aceh", pulau: "Sumatera", luasTotal: 163_000, luasDegradasi: 51_000, targetRestorasi: 25_000, realisasi: 11_200, persenRealisasi: 44.8, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Jambi", pulau: "Sumatera", luasTotal: 89_000, luasDegradasi: 46_000, targetRestorasi: 22_000, realisasi: 7_800, persenRealisasi: 35.5, kondisi: "kritis", kkmdAktif: false },
  { provinsi: "Sumatera Barat", pulau: "Sumatera", luasTotal: 47_000, luasDegradasi: 18_000, targetRestorasi: 9_000, realisasi: 3_600, persenRealisasi: 40.0, kondisi: "sedang", kkmdAktif: false },
  { provinsi: "Bengkulu", pulau: "Sumatera", luasTotal: 31_000, luasDegradasi: 14_000, targetRestorasi: 7_000, realisasi: 2_400, persenRealisasi: 34.3, kondisi: "kritis", kkmdAktif: false },
  { provinsi: "Lampung", pulau: "Sumatera", luasTotal: 56_000, luasDegradasi: 29_000, targetRestorasi: 14_000, realisasi: 4_800, persenRealisasi: 34.3, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Kepulauan Bangka Belitung", pulau: "Sumatera", luasTotal: 43_000, luasDegradasi: 21_000, targetRestorasi: 11_000, realisasi: 3_900, persenRealisasi: 35.5, kondisi: "kritis", kkmdAktif: false },

  // Sulawesi
  { provinsi: "Sulawesi Selatan", pulau: "Sulawesi", luasTotal: 89_000, luasDegradasi: 42_000, targetRestorasi: 20_000, realisasi: 7_200, persenRealisasi: 36.0, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Sulawesi Tengah", pulau: "Sulawesi", luasTotal: 76_000, luasDegradasi: 27_000, targetRestorasi: 13_000, realisasi: 5_800, persenRealisasi: 44.6, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Sulawesi Utara", pulau: "Sulawesi", luasTotal: 52_000, luasDegradasi: 22_000, targetRestorasi: 11_000, realisasi: 4_100, persenRealisasi: 37.3, kondisi: "sedang", kkmdAktif: true },
  { provinsi: "Sulawesi Tenggara", pulau: "Sulawesi", luasTotal: 48_000, luasDegradasi: 19_000, targetRestorasi: 9_000, realisasi: 3_600, persenRealisasi: 40.0, kondisi: "sedang", kkmdAktif: false },
  { provinsi: "Gorontalo", pulau: "Sulawesi", luasTotal: 14_000, luasDegradasi: 6_000, targetRestorasi: 3_000, realisasi: 980, persenRealisasi: 32.7, kondisi: "kritis", kkmdAktif: false },
  { provinsi: "Sulawesi Barat", pulau: "Sulawesi", luasTotal: 21_000, luasDegradasi: 9_000, targetRestorasi: 4_500, realisasi: 1_400, persenRealisasi: 31.1, kondisi: "kritis", kkmdAktif: false },

  // Jawa & Bali & NTT
  { provinsi: "Jawa Timur", pulau: "Jawa", luasTotal: 34_000, luasDegradasi: 19_000, targetRestorasi: 9_500, realisasi: 2_800, persenRealisasi: 29.5, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Jawa Tengah", pulau: "Jawa", luasTotal: 23_000, luasDegradasi: 14_000, targetRestorasi: 7_000, realisasi: 1_900, persenRealisasi: 27.1, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Jawa Barat", pulau: "Jawa", luasTotal: 17_000, luasDegradasi: 11_000, targetRestorasi: 5_500, realisasi: 1_400, persenRealisasi: 25.5, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Banten", pulau: "Jawa", luasTotal: 12_000, luasDegradasi: 8_000, targetRestorasi: 4_000, realisasi: 980, persenRealisasi: 24.5, kondisi: "kritis", kkmdAktif: false },
  { provinsi: "DKI Jakarta", pulau: "Jawa", luasTotal: 2_100, luasDegradasi: 1_800, targetRestorasi: 900, realisasi: 120, persenRealisasi: 13.3, kondisi: "kritis", kkmdAktif: true },
  { provinsi: "Nusa Tenggara Timur", pulau: "NTT/NTB", luasTotal: 29_000, luasDegradasi: 14_000, targetRestorasi: 7_000, realisasi: 2_100, persenRealisasi: 30.0, kondisi: "kritis", kkmdAktif: false },
  { provinsi: "Nusa Tenggara Barat", pulau: "NTT/NTB", luasTotal: 18_000, luasDegradasi: 8_000, targetRestorasi: 4_000, realisasi: 1_300, persenRealisasi: 32.5, kondisi: "kritis", kkmdAktif: false },
  { provinsi: "Bali", pulau: "Bali", luasTotal: 3_200, luasDegradasi: 1_400, targetRestorasi: 700, realisasi: 280, persenRealisasi: 40.0, kondisi: "sedang", kkmdAktif: true },
];

// ─── Program Restorasi Nasional ───────────────────────────────────────────────

export const PROGRAM_RESTORASI: ProgramRestorasi[] = [
  {
    nama: "Program Mangrove Nasional (PMN)",
    sumber: "Kementerian LHK / BRGMN",
    targetHektar: 600_000,
    realisasiHektar: 286_500,
    periodeAwal: 2021,
    periodeAkhir: 2024,
    status: "berjalan",
    keterangan: "Rehabilitasi mangrove 600.000 ha di 9 provinsi prioritas. Realisasi 2021-2024 sebesar 47,8% dari target.",
  },
  {
    nama: "BRGMN Restorasi Gambut & Mangrove",
    sumber: "BRGMN",
    targetHektar: 180_000,
    realisasiHektar: 98_200,
    periodeAwal: 2021,
    periodeAkhir: 2024,
    status: "berjalan",
    keterangan: "Fokus pada Riau, Sumatera Selatan, Kalimantan Barat, Kalimantan Tengah, Kalimantan Selatan, Papua, Papua Barat, Sulawesi Selatan, dan NTT.",
  },
  {
    nama: "Mangrove for Coastal Resilience (M4CR)",
    sumber: "World Bank / Kementerian LHK",
    targetHektar: 75_000,
    realisasiHektar: 32_400,
    periodeAwal: 2022,
    periodeAkhir: 2026,
    status: "berjalan",
    keterangan: "Proyek Bank Dunia senilai USD 200 juta untuk meningkatkan ketahanan pesisir melalui restorasi mangrove.",
  },
  {
    nama: "ICARE (Indonesia Coastal Rehabilitation)",
    sumber: "GEF / UNDP",
    targetHektar: 20_000,
    realisasiHektar: 11_800,
    periodeAwal: 2022,
    periodeAkhir: 2025,
    status: "berjalan",
    keterangan: "Rehabilitasi ekosistem pesisir terintegrasi di Sulawesi dan Nusa Tenggara.",
  },
  {
    nama: "Mangrove Biru Nusantara",
    sumber: "Swasta / CSR",
    targetHektar: 50_000,
    realisasiHektar: 18_600,
    periodeAwal: 2023,
    periodeAkhir: 2027,
    status: "berjalan",
    keterangan: "Kolaborasi 45 perusahaan untuk pemulihan mangrove berbasis Blue Carbon Credit.",
  },
];

// ─── Ancaman Utama ────────────────────────────────────────────────────────────

export const ANCAMAN_MANGROVE: AncamanMangrove[] = [
  {
    jenis: "Konversi lahan tambak",
    tingkat: "tinggi",
    provinsiTerdampak: ["Sulawesi Selatan", "Jawa Timur", "Lampung", "Riau"],
    luasTerdampak: 24_000,
  },
  {
    jenis: "Abrasi & erosi pantai",
    tingkat: "tinggi",
    provinsiTerdampak: ["Jawa Tengah", "Jawa Timur", "Sumatera Utara", "Kalimantan Timur"],
    luasTerdampak: 18_500,
  },
  {
    jenis: "Pencemaran & limbah industri",
    tingkat: "sedang",
    provinsiTerdampak: ["DKI Jakarta", "Jawa Barat", "Banten", "Riau"],
    luasTerdampak: 9_200,
  },
  {
    jenis: "Penebangan liar",
    tingkat: "sedang",
    provinsiTerdampak: ["Kalimantan Tengah", "Sumatera Selatan", "Papua"],
    luasTerdampak: 12_800,
  },
  {
    jenis: "Kenaikan permukaan laut (SLR)",
    tingkat: "tinggi",
    provinsiTerdampak: ["DKI Jakarta", "Jawa Tengah", "Kalimantan Utara", "Sulawesi Utara"],
    luasTerdampak: 31_000,
  },
  {
    jenis: "Pembangunan infrastruktur pesisir",
    tingkat: "sedang",
    provinsiTerdampak: ["DKI Jakarta", "Bali", "Sulawesi Tenggara", "Maluku"],
    luasTerdampak: 7_400,
  },
];

// ─── Ringkasan Nasional ───────────────────────────────────────────────────────

export const RINGKASAN_NASIONAL = {
  totalLuasMangrove: 3_364_080, // ha (KLHK 2023)
  persentaseDunia: 20.3,        // % dari total mangrove dunia
  luasDegradasi: 637_000,       // ha
  targetRestorasiTotal: 600_000,// ha (PMN 2021-2024)
  realisasiRestorasi: 286_500,  // ha (s/d 2024)
  persenRealisasi: 47.8,        // %
  jumlahKKMDProvinsi: 26,       // dari 34 provinsi
  jumlahKKMDKabupaten: 148,     // aktif
  karbon_tersimpan_MtCO2: 3_170,// juta ton CO2
  nilaiEkosistem_TrilyunRp: 850, // Rp 850 triliun/tahun
  TargetNDC_2030: 600_000,      // ha target NDC (Nationally Determined Contribution)
};

// ─── Potensi Blue Carbon ──────────────────────────────────────────────────────

export const DATA_BLUE_CARBON = {
  stokKarbon_tCO2_per_ha: 1_000,   // rata-rata
  potensiMitigasi_MtCO2_tahun: 23,  // juta ton CO2/tahun (jika terjaga)
  nilaiKarbon_USDperTon: 15,        // harga karbon rata-rata 2024
  potensiPendapatanBlueCarbon_MUSD: 345, // juta USD/tahun
  proyekTerdaftar: 12,
  proyekAktif: 7,
};

// ─── Context prompt untuk AI ─────────────────────────────────────────────────

export function buildMangroveContext(): string {
  const { RINGKASAN_NASIONAL: R, DATA_BLUE_CARBON: C } = { RINGKASAN_NASIONAL, DATA_BLUE_CARBON };

  const provinsiKritis = DATA_PROVINSI
    .filter((p) => p.kondisi === "kritis")
    .sort((a, b) => b.luasDegradasi - a.luasDegradasi)
    .slice(0, 8)
    .map((p) => `${p.provinsi} (degradasi: ${p.luasDegradasi.toLocaleString("id-ID")} ha, realisasi: ${p.persenRealisasi}%)`)
    .join("; ");

  const programStr = PROGRAM_RESTORASI
    .map((p) => `${p.nama}: target ${p.targetHektar.toLocaleString("id-ID")} ha, realisasi ${p.realisasiHektar.toLocaleString("id-ID")} ha (${Math.round((p.realisasiHektar / p.targetHektar) * 100)}%)`)
    .join("\n    - ");

  const ancamanStr = ANCAMAN_MANGROVE
    .filter((a) => a.tingkat === "tinggi")
    .map((a) => `${a.jenis} (${a.luasTerdampak.toLocaleString("id-ID")} ha/tahun)`)
    .join(", ");

  return `
=== DATA MANGROVE NASIONAL INDONESIA 2025 ===
Sumber: PMN, KKMD, BRGMN, Kementerian LHK

RINGKASAN:
- Total luas mangrove: ${R.totalLuasMangrove.toLocaleString("id-ID")} ha (${R.persentaseDunia}% mangrove dunia)
- Luas terdegradasi: ${R.luasDegradasi.toLocaleString("id-ID")} ha
- Target restorasi PMN 2021-2024: ${R.targetRestorasiTotal.toLocaleString("id-ID")} ha
- Realisasi s/d 2024: ${R.realisasiRestorasi.toLocaleString("id-ID")} ha (${R.persenRealisasi}%)
- KKMD aktif: ${R.jumlahKKMDProvinsi} provinsi, ${R.jumlahKKMDKabupaten} kabupaten
- Karbon tersimpan: ${R.karbon_tersimpan_MtCO2.toLocaleString("id-ID")} juta ton CO₂
- Nilai ekosistem: Rp ${R.nilaiEkosistem_TrilyunRp} triliun/tahun
- Target NDC 2030: ${R.TargetNDC_2030.toLocaleString("id-ID")} ha

PROVINSI KONDISI KRITIS (perlu intervensi segera):
    - ${provinsiKritis}

PROGRAM RESTORASI AKTIF:
    - ${programStr}

ANCAMAN UTAMA (tingkat tinggi):
    ${ancamanStr}

POTENSI BLUE CARBON:
- Stok karbon rata-rata: ${C.stokKarbon_tCO2_per_ha.toLocaleString("id-ID")} tCO₂/ha
- Potensi mitigasi: ${C.potensiMitigasi_MtCO2_tahun} juta ton CO₂/tahun
- Potensi pendapatan carbon credit: USD ${C.potensiPendapatanBlueCarbon_MUSD} juta/tahun
- Proyek blue carbon aktif: ${C.proyekAktif} dari ${C.proyekTerdaftar} terdaftar
`.trim();
}
