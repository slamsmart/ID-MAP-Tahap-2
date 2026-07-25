import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Static seed data (mirrors src/lib/abrasionData.ts) ──────────

interface SeedSite {
  no: number;
  namaPantai: string;
  kecamatanKab: string;
  indikasiAbrasi: string;
  kondisiSesudah: string;
  substrat: string;
  luasan: string;
  prioritas: string;
  tanamanRekomendasi: string[];
  lat: number;
  lng: number;
}

const SEED_DATA: SeedSite[] = [
  { no: 1, namaPantai: "Pantai Tanjung Penyu", kecamatanKab: "Pantai Tanjung Penyu, Jawa Timur", indikasiAbrasi: "Abrasi sedang", kondisiSesudah: "-", substrat: "Pasir", luasan: "0 ha", prioritas: "Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Pandan laut (Pandanus tectorius)", "Waru laut (Hibiscus tiliaceus)"], lat: -8.23, lng: 114.36 },
  { no: 2, namaPantai: "Pantai Bajulmati", kecamatanKab: "Pantai Bajulmati, Jawa Timur", indikasiAbrasi: "Abrasi sedang", kondisiSesudah: "-", substrat: "Pasir", luasan: "0 ha", prioritas: "Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Pandan laut (Pandanus tectorius)", "Waru laut (Hibiscus tiliaceus)"], lat: -8.18, lng: 114.26 },
  { no: 3, namaPantai: "Modangan", kecamatanKab: "Donomulyo, Kab. Malang", indikasiAbrasi: "Pantai terbuka, gelombang tinggi, aliran sungai dari daratan", kondisiSesudah: "Penyempitan pantai & minim vegetasi pelindung", substrat: "Pasir", luasan: "15–35 ha", prioritas: "Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Pandan laut (Pandanus tectorius)", "Rumput pantai (Spinifex littoreus)"], lat: -8.48, lng: 112.22 },
  { no: 4, namaPantai: "Ngliyep", kecamatanKab: "Donomulyo, Kab. Malang", indikasiAbrasi: "Ombak kuat", kondisiSesudah: "Penyempitan pantai", substrat: "Pasir", luasan: "20–50 ha", prioritas: "Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Pandan laut (Pandanus tectorius)"], lat: -8.44, lng: 112.31 },
  { no: 5, namaPantai: "Balekambang", kecamatanKab: "Bantur, Kab. Malang", indikasiAbrasi: "Gelombang tinggi", kondisiSesudah: "Erosi lokal", substrat: "Pasir", luasan: "15–40 ha", prioritas: "Rendah–Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Ketapang (Terminalia catappa)"], lat: -8.40, lng: 112.52 },
  { no: 6, namaPantai: "Jolangkung", kecamatanKab: "Gedangan, Kab. Malang", indikasiAbrasi: "Perubahan garis pantai", kondisiSesudah: "Erosi bertahap", substrat: "Pasir", luasan: "10–30 ha", prioritas: "Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Pandan laut (Pandanus tectorius)"], lat: -8.48, lng: 112.59 },
  { no: 7, namaPantai: "Bajul Mati", kecamatanKab: "Gedangan, Kab. Malang", indikasiAbrasi: "Abrasi kuat", kondisiSesudah: "Pengikisan garis pantai", substrat: "Pasir", luasan: "15–30 ha", prioritas: "Sedang", tanamanRekomendasi: ["Cemara laut (Casuarina equisetifolia)", "Waru laut (Hibiscus tiliaceus)"], lat: -8.47, lng: 112.62 },
  { no: 8, namaPantai: "Sendang Biru", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Abrasi parah, perubahan arus laut", kondisiSesudah: "Garis pantai mundur, mangrove berkurang", substrat: "Lumpur", luasan: "50–100 ha", prioritas: "Tinggi", tanamanRekomendasi: ["Rhizophora mucronata", "Avicennia marina", "Sonneratia alba"], lat: -8.42, lng: 112.70 },
  { no: 9, namaPantai: "Tamban", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Kerusakan mangrove luas", kondisiSesudah: "Banyak area terbuka & terdegradasi", substrat: "Lumpur", luasan: "344 ha (bagian CMC)", prioritas: "Tinggi", tanamanRekomendasi: ["Rhizophora apiculata", "Bruguiera gymnorrhiza", "Avicennia marina"], lat: -8.44, lng: 112.69 },
  { no: 10, namaPantai: "Clungup", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Degradasi mangrove", kondisiSesudah: "Sebagian area rusak → direhabilitasi", substrat: "Lumpur", luasan: "177 ha (bagian CMC)", prioritas: "Sedang", tanamanRekomendasi: ["Rhizophora apiculata", "Sonneratia alba"], lat: -8.45, lng: 112.66 },
  { no: 11, namaPantai: "Gatra", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Abrasi + akresi", kondisiSesudah: "Dinamika garis pantai tinggi", substrat: "Campuran", luasan: "0 ha (bagian CMC)", prioritas: "Sedang", tanamanRekomendasi: ["Rhizophora mucronata", "Cemara udang (Casuarina equisetifolia)"], lat: -8.43, lng: 112.68 },
  { no: 12, namaPantai: "Pantai Mini", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Abrasi tertinggi", kondisiSesudah: "Pantai menyempit signifikan", substrat: "Campuran", luasan: "0 ha (bagian CMC)", prioritas: "Tinggi", tanamanRekomendasi: ["Rhizophora stylosa", "Avicennia marina"], lat: -8.44, lng: 112.67 },
  { no: 13, namaPantai: "Tiga Warna", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Dinamika pantai", kondisiSesudah: "Fluktuasi garis pantai", substrat: "Campuran", luasan: "0 ha (bagian CMC)", prioritas: "Rendah–Sedang", tanamanRekomendasi: ["Avicennia marina", "Rhizophora mucronata"], lat: -8.46, lng: 112.65 },
  { no: 14, namaPantai: "Goa China", kecamatanKab: "Sumbermanjing Wetan, Kab. Malang", indikasiAbrasi: "Erosi pasir", kondisiSesudah: "Bukit pasir menurun", substrat: "Pasir", luasan: "10–25 ha", prioritas: "Sedang", tanamanRekomendasi: ["Pandan laut (Pandanus tectorius)", "Spinifex littoreus"], lat: -8.47, lng: 112.63 },
  { no: 15, namaPantai: "Jonggring Saloko", kecamatanKab: "Ampelgading, Kab. Malang", indikasiAbrasi: "Erosi tebing", kondisiSesudah: "Longsoran & erosi lokal", substrat: "Berbatu", luasan: "5–15 ha", prioritas: "Rendah–Sedang", tanamanRekomendasi: ["Ketapang (Terminalia catappa)", "Waru laut (Hibiscus tiliaceus)"], lat: -8.32, lng: 112.87 },
];

// ─── Helpers ─────────────────────────────────────────────────────

async function ensureSeeded(ctx: any) {
  const existing = await ctx.db.query("abrasionSites").first();
  if (existing) return false;
  const now = Date.now();
  for (const site of SEED_DATA) {
    await ctx.db.insert("abrasionSites", { ...site, updatedAt: now });
  }
  return true;
}

// ─── Queries ─────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("abrasionSites").collect();
  },
});

// ─── Mutations ───────────────────────────────────────────────────

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const seeded = await ensureSeeded(ctx);
    return { seeded };
  },
});

export const updateCoords = mutation({
  args: { no: v.number(), lat: v.number(), lng: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("abrasionSites")
      .withIndex("by_no", (q) => q.eq("no", args.no))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lat: args.lat,
        lng: args.lng,
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateSite = mutation({
  args: {
    no: v.number(),
    namaPantai: v.string(),
    kecamatanKab: v.string(),
    indikasiAbrasi: v.string(),
    kondisiSesudah: v.string(),
    substrat: v.string(),
    luasan: v.string(),
    prioritas: v.string(),
    tanamanRekomendasi: v.array(v.string()),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("abrasionSites")
      .withIndex("by_no", (q) => q.eq("no", args.no))
      .first();
    if (!existing) {
      // Belum ada di DB (masih pakai static seed di client) → insert
      await ctx.db.insert("abrasionSites", {
        no: args.no,
        namaPantai: args.namaPantai,
        kecamatanKab: args.kecamatanKab,
        indikasiAbrasi: args.indikasiAbrasi,
        kondisiSesudah: args.kondisiSesudah,
        substrat: args.substrat,
        luasan: args.luasan,
        prioritas: args.prioritas,
        tanamanRekomendasi: args.tanamanRekomendasi,
        lat: args.lat,
        lng: args.lng,
        updatedAt: Date.now(),
      });
      return { ok: true, created: true };
    }
    const { no: _no, ...fields } = args;
    await ctx.db.patch(existing._id, { ...fields, updatedAt: Date.now() });
    return { ok: true, created: false };
  },
});

export const addSite = mutation({
  args: {
    namaPantai: v.string(),
    kecamatanKab: v.string(),
    indikasiAbrasi: v.string(),
    kondisiSesudah: v.string(),
    substrat: v.string(),
    luasan: v.string(),
    prioritas: v.string(),
    tanamanRekomendasi: v.array(v.string()),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("abrasionSites").collect();
    const maxNo = all.length > 0 ? Math.max(...all.map((s) => s.no)) : 0;
    await ctx.db.insert("abrasionSites", {
      ...args,
      no: maxNo + 1,
      updatedAt: Date.now(),
    });
  },
});

export const deleteSite = mutation({
  args: { no: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("abrasionSites")
      .withIndex("by_no", (q) => q.eq("no", args.no))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
