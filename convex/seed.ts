import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// Hash plaintext password sekali, di-cache per-process. Cost 10 sama
// dengan users.ts:hashPassword supaya seed account perilakunya identik
// dengan user yang register normal. Idempoten: kalau dipanggil dua kali
// tidak akan re-hash bcrypt yang sudah ter-hash.
const BCRYPT_COST = 10;
const _hashCache = new Map<string, string>();
function hp(plain: string): string {
  if (plain.startsWith("$2")) return plain;
  const cached = _hashCache.get(plain);
  if (cached) return cached;
  const out = bcrypt.hashSync(plain, BCRYPT_COST);
  _hashCache.set(plain, out);
  return out;
}

export const seedAll = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Check if already seeded
    const existingUsers = await ctx.db.query("users").first();
    if (existingUsers) {
      return "Database sudah terisi. Seed dibatalkan.";
    }

    // ─── Seed Users ──────────────────────────────────────────────
    const adminId = await ctx.db.insert("users", {
      email: "admin@idmap.id",
      password: hp("admin123"),
      name: "Admin ID-MAP",
      role: "admin",
      createdAt: Date.now(),
    });

    const userId = await ctx.db.insert("users", {
      email: "user@idmap.id",
      password: hp("user123"),
      name: "Andi Pratama",
      role: "sahabat",
      kycStatus: "terverifikasi",
      organization: "Komunitas Peduli Mangrove",
      phone: "0812-0000-0001",
      createdAt: Date.now(),
    });

    const corpId = await ctx.db.insert("users", {
      email: "verifikator@idmap.id",
      password: hp("verif123"),
      name: "Tim Verifikator Pesisir",
      role: "verifikator",
      kycStatus: "terverifikasi",
      organization: "BPSPL Denpasar",
      phone: "031-5550001",
      address: "Jl. Ikan Dorang No. 1, Surabaya",
      createdAt: Date.now(),
    });

    const mitraId = await ctx.db.insert("users", {
      email: "mitra@idmap.id",
      password: hp("mitra123"),
      name: "Mitra Proyek Mangrove",
      role: "mitra",
      kycStatus: "terverifikasi",
      organization: "Yayasan Mangrove Nusantara",
      phone: "0812-3456-7890",
      address: "Jl. Pantai Indah No. 5, Banyuwangi",
      createdAt: Date.now(),
    });

    // Extra mitra with pending KYC for demo
    const mitraPendingId = await ctx.db.insert("users", {
      email: "baru@idmap.id",
      password: hp("baru123"),
      name: "Ahmad Fauzi",
      role: "mitra",
      kycStatus: "menunggu",
      organization: "Kelompok Tani Pesisir",
      phone: "0813-9876-5432",
      address: "Jl. Nelayan No. 12, Demak",
      createdAt: Date.now(),
    });

    // Extra verifikator with rejected KYC for demo
    const corpRejectedId = await ctx.db.insert("users", {
      email: "verif2@idmap.id",
      password: hp("verif456"),
      name: "Verifikator Lapangan",
      role: "verifikator",
      kycStatus: "ditolak",
      organization: "Dinas Kelautan Jatim",
      phone: "031-5550099",
      address: "Jl. Ahmad Yani No. 88, Surabaya",
      createdAt: Date.now(),
    });

    // ─── Seed Projects ───────────────────────────────────────────
    const proj1 = await ctx.db.insert("projects", {
      title: "Rehabilitasi Mangrove Banyuwangi",
      location: "Banyuwangi, Jawa Timur",
      province: "Jawa Timur",
      image: "https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800&auto=format&fit=crop",
      status: "Terverifikasi",
      co2Absorption: 100000,
      area: 150,
      seedsPlanted: 500000,
      mitraId: mitraId,
      progress: 68,
      srnStatus: "Terdaftar",
      serviceType: "Rehabilitasi Mangrove",
      description: "Rehabilitasi kawasan mangrove terdegradasi di pesisir Banyuwangi untuk meningkatkan serapan karbon dan keanekaragaman hayati.",
      createdAt: Date.now() - 86400000 * 30,
    });

    const proj2 = await ctx.db.insert("projects", {
      title: "Penyulaman Mangrove Kapuas Hulu",
      location: "Kapuas Hulu, Kalimantan Barat",
      province: "Kalimantan Barat",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&auto=format&fit=crop",
      status: "Dalam Proses",
      co2Absorption: 350000,
      area: 85,
      seedsPlanted: 285000,
      mitraId: mitraId,
      progress: 45,
      srnStatus: "Pending",
      serviceType: "Penyulaman Mangrove",
      description: "Penyulaman bibit mangrove di kawasan riparian Kapuas Hulu untuk meningkatkan kepadatan tegakan.",
      createdAt: Date.now() - 86400000 * 20,
    });

    const proj3 = await ctx.db.insert("projects", {
      title: "Monev Mangrove Pesisir Demak",
      location: "Demak, Jawa Tengah",
      province: "Jawa Tengah",
      image: "https://images.unsplash.com/photo-1573655349936-de5f098b6689?w=800&auto=format&fit=crop",
      status: "Terverifikasi",
      co2Absorption: 80000,
      area: 60,
      seedsPlanted: 200760,
      progress: 80,
      srnStatus: "Terdaftar",
      serviceType: "Jasa Pemantauan Monev Mangrove",
      description: "Monitoring dan evaluasi kesehatan ekosistem mangrove di pesisir utara Jawa Tengah secara berkala.",
      createdAt: Date.now() - 86400000 * 45,
    });

    const proj4 = await ctx.db.insert("projects", {
      title: "Decarbonisasi Aquaculture Sumba",
      location: "Sumba, Nusa Tenggara Timur",
      province: "Nusa Tenggara Timur",
      image: "https://images.unsplash.com/photo-1565118531796-763e5082d113?w=800&auto=format&fit=crop",
      status: "Terverifikasi",
      co2Absorption: 120000,
      area: 200,
      seedsPlanted: 300000,
      progress: 55,
      srnStatus: "Terdaftar",
      serviceType: "Decarbonisasi Aquaculture",
      description: "Integrasi mangrove dalam tambak udang untuk mengurangi emisi karbon dan meningkatkan produktivitas berkelanjutan.",
      createdAt: Date.now() - 86400000 * 60,
    });

    const proj5 = await ctx.db.insert("projects", {
      title: "Rehabilitasi Habitat Penyu Bali",
      location: "Badung, Bali",
      province: "Bali",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
      status: "Dalam Proses",
      co2Absorption: 45000,
      area: 30,
      seedsPlanted: 120000,
      mitraId: mitraId,
      progress: 35,
      srnStatus: "Pending",
      serviceType: "Perbaikan Habitat Penyu",
      description: "Perbaikan habitat peneluran penyu dan ekosistem mangrove pesisir Bali untuk perlindungan spesies dilindungi.",
      createdAt: Date.now() - 86400000 * 15,
    });

    await ctx.db.insert("projects", {
      title: "Pemberdayaan Pokmaswas Malang Selatan",
      location: "Malang Selatan, Jawa Timur",
      province: "Jawa Timur",
      image: "https://images.unsplash.com/photo-1559827291-72f4c2d42bc8?w=800&auto=format&fit=crop",
      status: "Draft",
      co2Absorption: 60000,
      area: 45,
      seedsPlanted: 0,
      mitraId: mitraId,
      progress: 10,
      srnStatus: "Belum",
      serviceType: "Pemberdayaan Masyarakat Pesisir",
      description: "Penguatan kapasitas Pokmaswas di pesisir Malang Selatan untuk pengawasan dan pengelolaan ekosistem mangrove.",
      createdAt: Date.now() - 86400000 * 5,
    });

    // ─── Seed Transactions ───────────────────────────────────────
    await ctx.db.insert("transactions", {
      companyName: "PT. Hijau Lestari",
      companyId: corpId,
      projectId: proj1,
      co2Amount: 10000,
      pricePerTon: 65000,
      totalAmount: 650000000,
      status: "Selesai",
      createdAt: Date.now() - 86400000 * 3,
    });

    await ctx.db.insert("transactions", {
      companyName: "PT. Bumi Sejahtera",
      projectId: proj2,
      co2Amount: 5000,
      pricePerTon: 65000,
      totalAmount: 325000000,
      status: "Selesai",
      createdAt: Date.now() - 86400000 * 7,
    });

    await ctx.db.insert("transactions", {
      companyName: "PT. Energi Bersih",
      projectId: proj3,
      co2Amount: 8000,
      pricePerTon: 65000,
      totalAmount: 520000000,
      status: "Selesai",
      createdAt: Date.now() - 86400000 * 10,
    });

    // ─── Seed Contributions ──────────────────────────────────────
    await ctx.db.insert("contributions", {
      userId: userId,
      projectId: proj1,
      amount: 10000,
      co2Equivalent: 0.5,
      method: "QRIS",
      createdAt: Date.now() - 86400000 * 5,
    });

    await ctx.db.insert("contributions", {
      userId: userId,
      projectId: proj3,
      amount: 15000,
      co2Equivalent: 0.75,
      method: "QRIS",
      createdAt: Date.now() - 86400000 * 10,
    });

    await ctx.db.insert("contributions", {
      projectId: proj1,
      amount: 750000000,
      co2Equivalent: 5000,
      method: "CSR",
      createdAt: Date.now() - 86400000 * 15,
    });

    // ─── Seed MRV Reports ────────────────────────────────────────
    await ctx.db.insert("mrvReports", {
      projectId: proj1,
      period: "Q1 2026",
      type: "Monitoring",
      status: "Selesai",
      createdAt: Date.now() - 86400000 * 30,
    });

    await ctx.db.insert("mrvReports", {
      projectId: proj1,
      period: "Q1 2026",
      type: "Reporting",
      status: "Dalam Proses",
      createdAt: Date.now() - 86400000 * 15,
    });

    await ctx.db.insert("mrvReports", {
      projectId: proj1,
      period: "Q1 2026",
      type: "Verification",
      status: "Menunggu",
      createdAt: Date.now() - 86400000 * 5,
    });

    // ─── Seed System Activities ──────────────────────────────────
    await ctx.db.insert("systemActivities", {
      text: 'Proyek "Rehabilitasi Mangrove Banyuwangi" disetujui dan terdaftar di SRN',
      type: "project",
      createdAt: Date.now() - 86400000 * 1,
    });

    await ctx.db.insert("systemActivities", {
      text: 'Verifikasi MRV untuk proyek "Monev Mangrove Pesisir Demak" selesai',
      type: "verification",
      createdAt: Date.now() - 86400000 * 2,
    });

    await ctx.db.insert("systemActivities", {
      text: 'PT. Hijau Lestari membeli 10.000 tCO₂e dari proyek "Rehabilitasi Mangrove Banyuwangi"',
      type: "transaction",
      createdAt: Date.now() - 86400000 * 3,
    });

    // ─── Seed Platform Stats ─────────────────────────────────────
    await ctx.db.insert("platformStats", {
      key: "sahabat_terlibat",
      value: "12.456",
      numericValue: 12456,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("platformStats", {
      key: "bibit_ditanam",
      value: "1.285.760",
      numericValue: 1285760,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("platformStats", {
      key: "serapan_karbon",
      value: "823.456",
      numericValue: 823456,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("platformStats", {
      key: "potensi_nilai_carbon",
      value: "Rp 98,65 M",
      numericValue: 98650000000,
      updatedAt: Date.now(),
    });

    // ─── Seed KYC Documents ──────────────────────────────────────────
    // Verified mitra documents
    await ctx.db.insert("kycDocuments", {
      userId: mitraId,
      type: "KTP",
      documentName: "KTP_Mitra_Mangrove.pdf",
      status: "Disetujui",
      reviewedBy: adminId,
      reviewedAt: Date.now() - 86400000 * 20,
      submittedAt: Date.now() - 86400000 * 25,
    });

    await ctx.db.insert("kycDocuments", {
      userId: mitraId,
      type: "NIB",
      documentName: "NIB_Yayasan_Mangrove.pdf",
      status: "Disetujui",
      reviewedBy: adminId,
      reviewedAt: Date.now() - 86400000 * 20,
      submittedAt: Date.now() - 86400000 * 25,
    });

    // Verified corporate documents
    await ctx.db.insert("kycDocuments", {
      userId: corpId,
      type: "KTP",
      documentName: "KTP_Direktur_HijauLestari.pdf",
      status: "Disetujui",
      reviewedBy: adminId,
      reviewedAt: Date.now() - 86400000 * 15,
      submittedAt: Date.now() - 86400000 * 18,
    });

    await ctx.db.insert("kycDocuments", {
      userId: corpId,
      type: "NIB",
      documentName: "NIB_PT_HijauLestari.pdf",
      status: "Disetujui",
      reviewedBy: adminId,
      reviewedAt: Date.now() - 86400000 * 15,
      submittedAt: Date.now() - 86400000 * 18,
    });

    await ctx.db.insert("kycDocuments", {
      userId: corpId,
      type: "NPWP",
      documentName: "NPWP_PT_HijauLestari.pdf",
      status: "Disetujui",
      reviewedBy: adminId,
      reviewedAt: Date.now() - 86400000 * 15,
      submittedAt: Date.now() - 86400000 * 18,
    });

    // Pending mitra documents (for admin queue)
    await ctx.db.insert("kycDocuments", {
      userId: mitraPendingId,
      type: "KTP",
      documentName: "KTP_Ahmad_Fauzi.pdf",
      status: "Menunggu",
      submittedAt: Date.now() - 86400000 * 2,
    });

    await ctx.db.insert("kycDocuments", {
      userId: mitraPendingId,
      type: "NIB",
      documentName: "NIB_Kelompok_Tani.pdf",
      status: "Menunggu",
      submittedAt: Date.now() - 86400000 * 2,
    });

    // Rejected corporate documents
    await ctx.db.insert("kycDocuments", {
      userId: corpRejectedId,
      type: "KTP",
      documentName: "KTP_Borneo_Green.pdf",
      status: "Ditolak",
      reviewNote: "Foto KTP tidak jelas, silakan upload ulang dengan resolusi lebih tinggi",
      reviewedBy: adminId,
      reviewedAt: Date.now() - 86400000 * 5,
      submittedAt: Date.now() - 86400000 * 8,
    });

    await ctx.db.insert("kycDocuments", {
      userId: corpRejectedId,
      type: "NIB",
      documentName: "NIB_PT_Borneo.pdf",
      status: "Menunggu",
      submittedAt: Date.now() - 86400000 * 3,
    });

    return "Seed berhasil! Users: 6, Projects: 6, Transactions: 3, Contributions: 3, MRV: 3, Activities: 3, Stats: 4, KYC Docs: 8";
  },
});

// ─── resetAndSeed: wipe all data then seed fresh ──────────────────────────────
export const resetAndSeed = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const tables = [
      "kycDocuments", "systemActivities", "platformStats",
      "mrvReports", "contributions", "certificates",
      "transactions", "projects", "users",
    ] as const;

    for (const table of tables) {
      const docs = await (ctx.db.query(table) as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    // Re-use seedAll handler logic inline
    const adminId = await ctx.db.insert("users", {
      email: "admin@idmap.id", password: hp("admin123"),
      name: "Admin ID-MAP", role: "admin", createdAt: Date.now(),
    });
    const userId = await ctx.db.insert("users", {
      email: "user@idmap.id", password: hp("user123"),
      name: "Andi Pratama", role: "sahabat",
      kycStatus: "terverifikasi",
      organization: "Komunitas Peduli Mangrove",
      phone: "0812-0000-0001",
      createdAt: Date.now(),
    });
    const verifikatorId = await ctx.db.insert("users", {
      email: "verifikator@idmap.id", password: hp("verif123"),
      name: "Tim Verifikator Pesisir", role: "verifikator",
      kycStatus: "terverifikasi", organization: "BPSPL Denpasar",
      phone: "031-5550001", address: "Jl. Ikan Dorang No. 1, Surabaya",
      createdAt: Date.now(),
    });
    const mitraId = await ctx.db.insert("users", {
      email: "mitra@idmap.id", password: hp("mitra123"),
      name: "Mitra Proyek Mangrove", role: "mitra",
      kycStatus: "terverifikasi", organization: "Yayasan Mangrove Nusantara",
      phone: "0812-3456-7890", address: "Jl. Pantai Indah No. 5, Banyuwangi",
      createdAt: Date.now(),
    });
    const mitraPendingId = await ctx.db.insert("users", {
      email: "baru@idmap.id", password: hp("baru123"),
      name: "Ahmad Fauzi", role: "mitra", kycStatus: "menunggu",
      organization: "Kelompok Tani Pesisir", phone: "0813-9876-5432",
      address: "Jl. Nelayan No. 12, Demak", createdAt: Date.now(),
    });
    const mitraRejectedId = await ctx.db.insert("users", {
      email: "ditolak@idmap.id", password: hp("ditolak123"),
      name: "Verifikator Lapangan", role: "verifikator",
      kycStatus: "ditolak", organization: "Dinas Kelautan Jatim",
      phone: "031-5550099", address: "Jl. Ahmad Yani No. 88, Surabaya",
      createdAt: Date.now(),
    });

    const proj1 = await ctx.db.insert("projects", {
      title: "Rehabilitasi Mangrove Banyuwangi", location: "Banyuwangi, Jawa Timur",
      province: "Jawa Timur", image: "https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800&auto=format&fit=crop",
      status: "Terverifikasi", co2Absorption: 100000, area: 150,
      seedsPlanted: 500000, mitraId, progress: 68, srnStatus: "Terdaftar",
      serviceType: "Rehabilitasi Mangrove",
      description: "Rehabilitasi kawasan mangrove terdegradasi di pesisir Banyuwangi untuk meningkatkan serapan karbon dan keanekaragaman hayati.",
      createdAt: Date.now() - 86400000 * 30,
    });
    const proj2 = await ctx.db.insert("projects", {
      title: "Penyulaman Mangrove Kapuas Hulu", location: "Kapuas Hulu, Kalimantan Barat",
      province: "Kalimantan Barat", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&auto=format&fit=crop",
      status: "Dalam Proses", co2Absorption: 350000, area: 85,
      seedsPlanted: 285000, mitraId, progress: 45, srnStatus: "Pending",
      serviceType: "Penyulaman Mangrove",
      description: "Penyulaman bibit mangrove di kawasan riparian Kapuas Hulu untuk meningkatkan kepadatan tegakan.",
      createdAt: Date.now() - 86400000 * 20,
    });
    const proj3 = await ctx.db.insert("projects", {
      title: "Monev Mangrove Pesisir Demak", location: "Demak, Jawa Tengah",
      province: "Jawa Tengah", image: "https://images.unsplash.com/photo-1573655349936-de5f098b6689?w=800&auto=format&fit=crop",
      status: "Terverifikasi", co2Absorption: 80000, area: 60,
      seedsPlanted: 200760, progress: 80, srnStatus: "Terdaftar",
      serviceType: "Jasa Pemantauan Monev Mangrove",
      description: "Monitoring dan evaluasi kesehatan ekosistem mangrove di pesisir utara Jawa Tengah secara berkala.",
      createdAt: Date.now() - 86400000 * 45,
    });
    const proj4 = await ctx.db.insert("projects", {
      title: "Decarbonisasi Aquaculture Sumba", location: "Sumba, Nusa Tenggara Timur",
      province: "Nusa Tenggara Timur", image: "https://images.unsplash.com/photo-1565118531796-763e5082d113?w=800&auto=format&fit=crop",
      status: "Terverifikasi", co2Absorption: 120000, area: 200,
      seedsPlanted: 300000, progress: 55, srnStatus: "Terdaftar",
      serviceType: "Decarbonisasi Aquaculture",
      description: "Integrasi mangrove dalam tambak udang untuk mengurangi emisi karbon dan meningkatkan produktivitas berkelanjutan.",
      createdAt: Date.now() - 86400000 * 60,
    });
    const proj5 = await ctx.db.insert("projects", {
      title: "Rehabilitasi Habitat Penyu Bali", location: "Badung, Bali",
      province: "Bali", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
      status: "Dalam Proses", co2Absorption: 45000, area: 30,
      seedsPlanted: 120000, mitraId, progress: 35, srnStatus: "Pending",
      serviceType: "Perbaikan Habitat Penyu",
      description: "Perbaikan habitat peneluran penyu dan ekosistem mangrove pesisir Bali untuk perlindungan spesies dilindungi.",
      createdAt: Date.now() - 86400000 * 15,
    });
    await ctx.db.insert("projects", {
      title: "Pemberdayaan Pokmaswas Malang Selatan", location: "Malang Selatan, Jawa Timur",
      province: "Jawa Timur", image: "https://images.unsplash.com/photo-1559827291-72f4c2d42bc8?w=800&auto=format&fit=crop",
      status: "Draft", co2Absorption: 60000, area: 45,
      seedsPlanted: 0, mitraId, progress: 10, srnStatus: "Belum",
      serviceType: "Pemberdayaan Masyarakat Pesisir",
      description: "Penguatan kapasitas Pokmaswas di pesisir Malang Selatan untuk pengawasan dan pengelolaan ekosistem mangrove.",
      createdAt: Date.now() - 86400000 * 5,
    });

    await ctx.db.insert("transactions", {
      companyName: "PT. Hijau Lestari", companyId: verifikatorId, projectId: proj1,
      co2Amount: 10000, pricePerTon: 65000, totalAmount: 650000000,
      status: "Selesai", createdAt: Date.now() - 86400000 * 3,
    });
    await ctx.db.insert("transactions", {
      companyName: "PT. Bumi Sejahtera", projectId: proj2,
      co2Amount: 5000, pricePerTon: 65000, totalAmount: 325000000,
      status: "Selesai", createdAt: Date.now() - 86400000 * 7,
    });
    await ctx.db.insert("transactions", {
      companyName: "PT. Energi Bersih", projectId: proj3,
      co2Amount: 8000, pricePerTon: 65000, totalAmount: 520000000,
      status: "Selesai", createdAt: Date.now() - 86400000 * 10,
    });

    await ctx.db.insert("contributions", { userId, projectId: proj1, amount: 10000, co2Equivalent: 0.5, method: "QRIS", createdAt: Date.now() - 86400000 * 5 });
    await ctx.db.insert("contributions", { userId, projectId: proj3, amount: 15000, co2Equivalent: 0.75, method: "QRIS", createdAt: Date.now() - 86400000 * 10 });
    await ctx.db.insert("contributions", { projectId: proj1, amount: 750000000, co2Equivalent: 5000, method: "CSR", createdAt: Date.now() - 86400000 * 15 });

    await ctx.db.insert("mrvReports", { projectId: proj1, period: "Q1 2026", type: "Monitoring", status: "Selesai", createdAt: Date.now() - 86400000 * 30 });
    await ctx.db.insert("mrvReports", { projectId: proj1, period: "Q1 2026", type: "Reporting", status: "Dalam Proses", createdAt: Date.now() - 86400000 * 15 });
    await ctx.db.insert("mrvReports", { projectId: proj1, period: "Q1 2026", type: "Verification", status: "Menunggu", createdAt: Date.now() - 86400000 * 5 });

    await ctx.db.insert("systemActivities", { text: 'Proyek "Rehabilitasi Mangrove Banyuwangi" disetujui dan terdaftar di SRN', type: "project", createdAt: Date.now() - 86400000 });
    await ctx.db.insert("systemActivities", { text: 'Verifikasi MRV untuk proyek "Monev Mangrove Pesisir Demak" selesai', type: "verification", createdAt: Date.now() - 86400000 * 2 });
    await ctx.db.insert("systemActivities", { text: 'PT. Hijau Lestari membeli 10.000 tCO₂e dari proyek "Rehabilitasi Mangrove Banyuwangi"', type: "transaction", createdAt: Date.now() - 86400000 * 3 });

    await ctx.db.insert("platformStats", { key: "sahabat_terlibat", value: "12.456", numericValue: 12456, updatedAt: Date.now() });
    await ctx.db.insert("platformStats", { key: "bibit_ditanam", value: "1.285.760", numericValue: 1285760, updatedAt: Date.now() });
    await ctx.db.insert("platformStats", { key: "serapan_karbon", value: "823.456", numericValue: 823456, updatedAt: Date.now() });
    await ctx.db.insert("platformStats", { key: "potensi_nilai_carbon", value: "Rp 98,65 M", numericValue: 98650000000, updatedAt: Date.now() });

    await ctx.db.insert("kycDocuments", { userId: mitraId, type: "KTP", documentName: "KTP_Mitra_Mangrove.pdf", status: "Disetujui", reviewedBy: adminId, reviewedAt: Date.now() - 86400000 * 20, submittedAt: Date.now() - 86400000 * 25 });
    await ctx.db.insert("kycDocuments", { userId: mitraId, type: "NIB", documentName: "NIB_Yayasan_Mangrove.pdf", status: "Disetujui", reviewedBy: adminId, reviewedAt: Date.now() - 86400000 * 20, submittedAt: Date.now() - 86400000 * 25 });
    await ctx.db.insert("kycDocuments", { userId: verifikatorId, type: "KTP", documentName: "KTP_Verifikator_Pesisir.pdf", status: "Disetujui", reviewedBy: adminId, reviewedAt: Date.now() - 86400000 * 15, submittedAt: Date.now() - 86400000 * 18 });
    await ctx.db.insert("kycDocuments", { userId: mitraPendingId, type: "KTP", documentName: "KTP_Ahmad_Fauzi.pdf", status: "Menunggu", submittedAt: Date.now() - 86400000 * 2 });
    await ctx.db.insert("kycDocuments", { userId: mitraPendingId, type: "NIB", documentName: "NIB_Kelompok_Tani.pdf", status: "Menunggu", submittedAt: Date.now() - 86400000 * 2 });
    await ctx.db.insert("kycDocuments", { userId: mitraRejectedId, type: "KTP", documentName: "KTP_Verifikator_Lapangan.pdf", status: "Ditolak", reviewNote: "Dokumen tidak jelas, upload ulang", reviewedBy: adminId, reviewedAt: Date.now() - 86400000 * 5, submittedAt: Date.now() - 86400000 * 8 });

    return "Reset & Seed berhasil! Users: 6, Projects: 6, Transactions: 3, Contributions: 3, MRV: 3, Activities: 3, Stats: 4, KYC Docs: 6";
  },
});

// ─── Seed Pokmaswas verified projects with funding targets ──────────
// Idempotent: skips projects that already exist (matched by title).
// Run: npx convex run seed:seedPokmaswasProjects
export const seedPokmaswasProjects = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Find a mitra user to attach as owner (optional)
    const mitra = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "mitra"))
      .first();
    const mitraId = mitra?._id;

    const FUNDING_TARGET = 100_000_000; // Rp 100 jt

    const projects = [
      {
        title: "Pokmaswas GOAL — Rehabilitasi Mangrove",
        location: "Pantai Clungup, Sumbermanjing Wetan, Malang Selatan",
        province: "Jawa Timur",
        image:
          "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&q=80&auto=format&fit=crop",
        co2Absorption: 75000,
        area: 30,
        seedsPlanted: 50000,
        description:
          "Rehabilitasi mangrove oleh Pokmaswas Gatra Olah Alam Lestari (GOAL) di Clungup Mangrove Conservation 3 Warna. Fokus pemulihan ekosistem pesisir Pantai Clungup, Gatra, dan Mini.",
        serviceType: "Rehabilitasi Mangrove",
        fundingTarget: FUNDING_TARGET,
        fundingRaised: 0,
      },
      {
        title: "Pokmaswas Pilar Harapan — Konservasi Habitat Penyu",
        location: "Pantai Sukamade, Taman Nasional Meru Betiri, Banyuwangi",
        province: "Jawa Timur",
        image:
          "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80&auto=format&fit=crop",
        co2Absorption: 45000,
        area: 20,
        seedsPlanted: 25000,
        description:
          "Pokmaswas Pilar Harapan menjaga habitat peneluran penyu di pesisir Banyuwangi. Patroli sarang, relokasi telur, dan pelepasan tukik untuk pemulihan populasi penyu.",
        serviceType: "Konservasi Habitat Penyu",
        fundingTarget: FUNDING_TARGET,
        fundingRaised: 0,
      },
      {
        title: "Pokmaswas Mina Mulya — Pemberdayaan Nelayan Pesisir",
        location: "Teluk Pangpang, Muncar, Banyuwangi",
        province: "Jawa Timur",
        image:
          "https://images.unsplash.com/photo-1573655349936-de6bed86f839?w=800&q=80&auto=format&fit=crop",
        co2Absorption: 60000,
        area: 35,
        seedsPlanted: 40000,
        description:
          "Pokmaswas Mina Mulya memberdayakan nelayan dan masyarakat pesisir Muncar lewat pengawasan sumber daya laut, perikanan berkelanjutan, dan penguatan ekonomi komunitas pesisir.",
        serviceType: "Pemberdayaan Masyarakat Pesisir",
        fundingTarget: FUNDING_TARGET,
        fundingRaised: 0,
      },
    ];

    // Cleanup any legacy/non-Pokmaswas projects so only the 3 Pokmaswas remain
    const newTitles = new Set(projects.map((p) => p.title));
    const allExisting = await ctx.db.query("projects").collect();
    let removed = 0;
    for (const old of allExisting) {
      if (!newTitles.has(old.title)) {
        await ctx.db.delete(old._id);
        removed++;
      }
    }

    let inserted = 0;
    let skipped = 0;
    const ids: string[] = [];

    for (const p of projects) {
      const existing = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("title"), p.title))
        .first();
      if (existing) {
        skipped++;
        ids.push(existing._id);
        continue;
      }
      const id = await ctx.db.insert("projects", {
        ...p,
        status: "Terverifikasi",
        progress: 5,
        srnStatus: "Belum",
        mitraId,
        createdAt: Date.now(),
      });
      inserted++;
      ids.push(id);
    }

    return `Pokmaswas seed: ${inserted} inserted, ${skipped} skipped, ${removed} removed. IDs: ${ids.join(", ")}`;
  },
});

// ─── Seed dummy certificates for the demo sahabat account ─────────────
// Idempotent: runs only when the sahabat account has no certificates yet.
// Run: npx convex run seed:seedDummyCertificates
export const seedDummyCertificates = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Resolve the demo sahabat user (seeded by resetAndSeed → user@idmap.id).
    // Fallback to the first sahabat user if the demo email is not present.
    let sahabat = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "user@idmap.id"))
      .first();
    if (!sahabat) {
      sahabat = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "sahabat"))
        .first();
    }
    if (!sahabat) {
      return "No sahabat user found — run seed:resetAndSeed first.";
    }

    // Skip if this user already has certificates (idempotent demo seed).
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_owner", (q) => q.eq("ownerId", sahabat._id))
      .first();
    if (existing) {
      return `Skipped: sahabat ${sahabat.email} already has certificates.`;
    }

    // Pull the 3 Pokmaswas projects to attach the dummy certificates to.
    const pokmaswasTitles = [
      "Pokmaswas GOAL — Rehabilitasi Mangrove",
      "Pokmaswas Pilar Harapan — Konservasi Habitat Penyu",
      "Pokmaswas Mina Mulya — Pemberdayaan Nelayan Pesisir",
    ];
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "Terverifikasi"))
      .collect();
    const pokmaswasProjects = projects.filter((p) =>
      pokmaswasTitles.includes(p.title)
    );
    if (pokmaswasProjects.length === 0) {
      return "No Pokmaswas projects found — run seed:seedPokmaswasProjects first.";
    }

    // Generate 1 contribution + 1 certificate per Pokmaswas project so
    // numbers look consistent on the user dashboard. Sertifikat di-tag
    // sebagai "contribution" (donasi via QRIS).
    const dummyAmounts = [50_000, 100_000, 25_000]; // IDR per project
    let issued = 0;
    const certNumbers: string[] = [];
    const now = Date.now();

    for (let i = 0; i < pokmaswasProjects.length; i++) {
      const proj = pokmaswasProjects[i];
      const amount = dummyAmounts[i] ?? 50_000;
      const co2 = +(amount / 5000).toFixed(4); // mirror /api/payment/create-qris

      // Insert a paid contribution so totals reconcile if anyone audits.
      await ctx.db.insert("contributions", {
        userId: sahabat._id,
        projectId: proj._id,
        amount,
        co2Equivalent: co2,
        method: "QRIS",
        paymentId: `dummy_seed_${proj._id.slice(-6)}_${now}`,
        paymentStatus: "paid",
        createdAt: now - (i + 1) * 86400000, // staggered dates for variety
      });

      // Bump funding raised on the project.
      await ctx.db.patch(proj._id, {
        fundingRaised: (proj.fundingRaised ?? 0) + amount,
      });

      const certNumber = `IDMAP-DON-${(now - i).toString(36).toUpperCase()}-${proj._id.slice(-6).toUpperCase()}`;
      await ctx.db.insert("certificates", {
        ownerId: sahabat._id,
        projectId: proj._id,
        type: "contribution",
        co2Amount: co2,
        issuedAt: now - (i + 1) * 86400000,
        certificateNumber: certNumber,
      });
      certNumbers.push(certNumber);
      issued++;
    }

    return `Dummy certs seeded for ${sahabat.email}: ${issued} certificates. Numbers: ${certNumbers.join(", ")}`;
  },
});

// ─── Dummy Gamifikasi (Leaderboard + Referral) ─────────────────────
// Buat ~12 sahabat dummy dengan poin/streak/bibit + rantai referral
// supaya leaderboard & kartu referral terisi realistis. Idempoten:
// skip kalau dummy sudah ada (cek email penanda).
export const seedGamificationDummy = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const marker = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "rani.dummy@idmap.id"))
      .first();
    if (marker) {
      return "Skipped: dummy gamifikasi sudah ada.";
    }

    const now = Date.now();
    const code = (name: string, n: number) =>
      name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, "X") +
      (1000 + n).toString();

    // points, streak, seedlingsCheckin, kyc — bervariasi untuk ranking.
    const dummies = [
      { name: "Rani Kusuma", first: "rani", points: 1180, streak: 22, best: 30, seed: 2, kyc: "terverifikasi" as const },
      { name: "Bagas Saputra", first: "bagas", points: 940, streak: 15, best: 18, seed: 1, kyc: "terverifikasi" as const },
      { name: "Sinta Maharani", first: "sinta", points: 870, streak: 9, best: 16, seed: 1, kyc: "terverifikasi" as const },
      { name: "Dewi Lestari", first: "dewi", points: 760, streak: 12, best: 15, seed: 1, kyc: "terverifikasi" as const },
      { name: "Fajar Nugroho", first: "fajar", points: 610, streak: 7, best: 11, seed: 0, kyc: "terverifikasi" as const },
      { name: "Putri Andini", first: "putri", points: 540, streak: 5, best: 9, seed: 0, kyc: "terverifikasi" as const },
      { name: "Yoga Pratama", first: "yoga", points: 430, streak: 3, best: 8, seed: 0, kyc: "menunggu" as const },
      { name: "Maya Anggraini", first: "maya", points: 360, streak: 6, best: 6, seed: 0, kyc: "terverifikasi" as const },
      { name: "Rizal Hakim", first: "rizal", points: 280, streak: 2, best: 5, seed: 0, kyc: "belum" as const },
      { name: "Nadia Salsabila", first: "nadia", points: 190, streak: 4, best: 4, seed: 0, kyc: "menunggu" as const },
      { name: "Galih Permana", first: "galih", points: 120, streak: 1, best: 3, seed: 0, kyc: "belum" as const },
      { name: "Tari Wulandari", first: "tari", points: 60, streak: 1, best: 2, seed: 0, kyc: "terverifikasi" as const },
    ];

    const ids: Record<string, any> = {};
    let i = 0;
    for (const d of dummies) {
      const id = await ctx.db.insert("users", {
        email: `${d.first}.dummy@idmap.id`,
        password: hp("dummy123"),
        name: d.name,
        role: "sahabat",
        kycStatus: d.kyc,
        phone: `0812-9000-${(1000 + i).toString().slice(-4)}`,
        referralCode: code(d.first, i),
        points: d.points,
        checkInStreak: d.streak,
        bestStreak: d.best,
        lastCheckInDate: jakartaDate(now - 86400000), // kemarin → streak bisa lanjut
        checkInTotal: d.best + 5,
        seedlingsCheckin: d.seed,
        createdAt: now - (i + 1) * 86400000,
      });
      ids[d.first] = id;
      i++;
    }

    // Rantai referral ter-KYC → top users punya referral count.
    // Rani ajak 12 (semua verified) → 1 bibit referral; Bagas ajak 8.
    const setRef = async (childFirst: string, parentFirst: string) => {
      if (ids[childFirst] && ids[parentFirst]) {
        await ctx.db.patch(ids[childFirst], { referredBy: ids[parentFirst] });
      }
    };
    // Rani referral chain
    for (const c of ["bagas", "sinta", "dewi", "fajar", "putri", "maya", "tari"]) {
      await setRef(c, "rani");
    }
    // Bagas referral
    for (const c of ["yoga", "nadia", "rizal", "galih"]) {
      await setRef(c, "bagas");
    }

    return `Seeded ${dummies.length} dummy sahabat untuk leaderboard + referral.`;
  },
});

// Jakarta date helper (UTC+7) — sama dengan convex/gamification.ts
function jakartaDate(ms: number): string {
  return new Date(ms + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
