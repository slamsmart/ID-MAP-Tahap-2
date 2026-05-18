import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
      password: "admin123",
      name: "Admin ID-MAP",
      role: "admin",
      createdAt: Date.now(),
    });

    const userId = await ctx.db.insert("users", {
      email: "user@idmap.id",
      password: "user123",
      name: "Andi Pratama",
      role: "komunitas",
      createdAt: Date.now(),
    });

    const corpId = await ctx.db.insert("users", {
      email: "corp@idmap.id",
      password: "corp123",
      name: "PT Hijau Lestari",
      role: "perusahaan",
      kycStatus: "terverifikasi",
      organization: "PT Hijau Lestari",
      phone: "021-5550001",
      address: "Jl. Sudirman No. 1, Jakarta Selatan",
      createdAt: Date.now(),
    });

    const mitraId = await ctx.db.insert("users", {
      email: "mitra@idmap.id",
      password: "mitra123",
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
      password: "baru123",
      name: "Ahmad Fauzi",
      role: "mitra",
      kycStatus: "menunggu",
      organization: "Kelompok Tani Pesisir",
      phone: "0813-9876-5432",
      address: "Jl. Nelayan No. 12, Demak",
      createdAt: Date.now(),
    });

    // Extra perusahaan with rejected KYC for demo
    const corpRejectedId = await ctx.db.insert("users", {
      email: "pending@corp.id",
      password: "pending123",
      name: "PT Borneo Green",
      role: "perusahaan",
      kycStatus: "ditolak",
      organization: "PT Borneo Green",
      phone: "021-5550099",
      address: "Jl. Gatot Subroto No. 88, Jakarta",
      createdAt: Date.now(),
    });

    // ─── Seed Projects ───────────────────────────────────────────
    const proj1 = await ctx.db.insert("projects", {
      title: "Reboisasi Mangrove Banyuwangi",
      location: "Banyuwangi, Jawa Timur",
      province: "Jawa Timur",
      image: "/images/mangrove-banyuwangi.jpg",
      status: "Terverifikasi",
      co2Absorption: 100000,
      area: 150,
      seedsPlanted: 500000,
      mitraId: mitraId,
      progress: 68,
      srnStatus: "Terdaftar",
      description: "Proyek reboisasi mangrove di pesisir Banyuwangi untuk meningkatkan serapan karbon.",
      createdAt: Date.now() - 86400000 * 30,
    });

    const proj2 = await ctx.db.insert("projects", {
      title: "Konservasi Mangrove Kalimantan",
      location: "Kapuas Hulu, Kalimantan Barat",
      province: "Kalimantan Barat",
      image: "/images/mangrove-kalimantan.jpg",
      status: "Dalam Proses",
      co2Absorption: 350000,
      area: 85,
      seedsPlanted: 285000,
      mitraId: mitraId,
      progress: 45,
      srnStatus: "Pending",
      description: "Konservasi hutan mangrove di kawasan Kapuas Hulu.",
      createdAt: Date.now() - 86400000 * 20,
    });

    const proj3 = await ctx.db.insert("projects", {
      title: "Mangrove Pantai Utara",
      location: "Demak, Jawa Tengah",
      province: "Jawa Tengah",
      image: "/images/mangrove-demak.jpg",
      status: "Terverifikasi",
      co2Absorption: 80000,
      area: 60,
      seedsPlanted: 200760,
      progress: 80,
      srnStatus: "Terdaftar",
      description: "Penanaman mangrove di pesisir utara Jawa.",
      createdAt: Date.now() - 86400000 * 45,
    });

    const proj4 = await ctx.db.insert("projects", {
      title: "Blue Carbon Mangrove",
      location: "Sumba, Nusa Tenggara Timur",
      province: "Nusa Tenggara Timur",
      image: "/images/mangrove-sumba.jpg",
      status: "Terverifikasi",
      co2Absorption: 120000,
      area: 200,
      seedsPlanted: 300000,
      progress: 55,
      srnStatus: "Terdaftar",
      description: "Proyek blue carbon di kepulauan Sumba.",
      createdAt: Date.now() - 86400000 * 60,
    });

    await ctx.db.insert("projects", {
      title: "Restorasi Mangrove Teluk Bintuni",
      location: "Teluk Bintuni, Papua Barat",
      province: "Papua Barat",
      image: "/images/mangrove-papua.jpg",
      status: "Draft",
      co2Absorption: 200000,
      area: 200,
      seedsPlanted: 0,
      mitraId: mitraId,
      progress: 15,
      srnStatus: "Belum",
      description: "Rencana restorasi mangrove di Teluk Bintuni.",
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
      text: 'Proyek "Reboisasi Mangrove Banyuwangi" disetujui dan terdaftar di SRN',
      type: "project",
      createdAt: Date.now() - 86400000 * 1,
    });

    await ctx.db.insert("systemActivities", {
      text: 'Verifikasi MRV untuk proyek "Konservasi Hutan Kapuas Hulu" selesai',
      type: "verification",
      createdAt: Date.now() - 86400000 * 2,
    });

    await ctx.db.insert("systemActivities", {
      text: 'PT. Hijau Lestari membeli 10.000 tCO₂e dari proyek "Agroforestry Kopi"',
      type: "transaction",
      createdAt: Date.now() - 86400000 * 3,
    });

    // ─── Seed Platform Stats ─────────────────────────────────────
    await ctx.db.insert("platformStats", {
      key: "komunitas_terlibat",
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

    return "Seed berhasil! Users: 6, Projects: 5, Transactions: 3, Contributions: 3, MRV: 3, Activities: 3, Stats: 4, KYC Docs: 8";
  },
});
