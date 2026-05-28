import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ───────────────────────────────────────────────────────
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("sahabat"),
      v.literal("mitra"),
      v.literal("mitra_facilitator"),
      v.literal("verifikator"),
      v.literal("admin"),
      v.literal("corporate")
    ),
    kycStatus: v.optional(
      v.union(
        v.literal("belum"),
        v.literal("menunggu"),
        v.literal("terverifikasi"),
        v.literal("ditolak")
      )
    ),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_kycStatus", ["kycStatus"]),

  // ─── Projects (Proyek Mangrove) ──────────────────────────────────
  projects: defineTable({
    title: v.string(),
    location: v.string(),
    province: v.string(),
    image: v.string(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Dalam Proses"),
      v.literal("Terverifikasi")
    ),
    co2Absorption: v.number(),    // in tCO2e
    area: v.optional(v.number()), // in hectares
    seedsPlanted: v.optional(v.number()),
    mitraId: v.optional(v.id("users")),
    progress: v.optional(v.number()), // 0-100
    srnStatus: v.optional(
      v.union(
        v.literal("Belum"),
        v.literal("Pending"),
        v.literal("Terdaftar")
      )
    ),
    description: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    fundingTarget: v.optional(v.number()),  // IDR
    fundingRaised: v.optional(v.number()),  // IDR (default 0)
    // Stage 11 NGO Layer — facilitator (NGO/akademisi/dll) sebagai
    // co-operator. Pokmaswas tetap "owner" via mitraId.
    facilitatorId: v.optional(v.id("users")),
    facilitatorOrgId: v.optional(v.id("partnerOrganizations")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_mitra", ["mitraId"])
    .index("by_facilitator", ["facilitatorId"])
    .index("by_status_and_created", ["status", "createdAt"]),

  serviceContent: defineTable({
    key: v.string(),
    titleId: v.string(),
    titleEn: v.string(),
    descriptionId: v.string(),
    descriptionEn: v.string(),
    image: v.string(),
    badgeText: v.string(),
    badgeClass: v.string(),
    iconBgClass: v.string(),
    iconName: v.string(),
    value1: v.string(),
    label1: v.string(),
    value2: v.string(),
    label2: v.string(),
    value3: v.string(),
    label3: v.string(),
    order: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_order", ["order"]),

  // ─── Transactions (Carbon Credit Purchases) ──────────────────────
  transactions: defineTable({
    companyName: v.string(),
    companyId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    co2Amount: v.number(),        // tCO2e purchased
    pricePerTon: v.number(),      // IDR per tCO2e
    totalAmount: v.number(),      // total IDR
    status: v.union(
      v.literal("Pending"),
      v.literal("Selesai"),
      v.literal("Gagal")
    ),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  // ─── Contributions (Community Donations) ─────────────────────────
  contributions: defineTable({
    userId: v.optional(v.id("users")),
    projectId: v.id("projects"),
    amount: v.number(),           // IDR
    co2Equivalent: v.number(),    // tCO2e supported
    method: v.union(
      v.literal("QRIS"),
      v.literal("Transfer"),
      v.literal("CSR")
    ),
    paymentId: v.optional(v.string()),   // mayar.id transaction/payment ID
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed")
    )),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_paymentId", ["paymentId"]),

  // ─── Certificates ────────────────────────────────────────────────
  certificates: defineTable({
    ownerId: v.id("users"),
    projectId: v.id("projects"),
    type: v.union(v.literal("carbon_credit"), v.literal("contribution")),
    co2Amount: v.number(),
    issuedAt: v.number(),
    certificateNumber: v.string(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_project", ["projectId"]),

  // ─── MRV Reports (Monitoring, Reporting, Verification) ───────────
  mrvReports: defineTable({
    projectId: v.id("projects"),
    period: v.string(),           // e.g. "Q1 2026"
    type: v.union(
      v.literal("Monitoring"),
      v.literal("Reporting"),
      v.literal("Verification")
    ),
    status: v.union(
      v.literal("Selesai"),
      v.literal("Dalam Proses"),
      v.literal("Menunggu")
    ),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  // ─── System Activities (Audit Log) ───────────────────────────────
  systemActivities: defineTable({
    text: v.string(),
    type: v.union(
      v.literal("project"),
      v.literal("transaction"),
      v.literal("user"),
      v.literal("verification"),
      v.literal("system")
    ),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // ─── OTP Codes (Email Verification) ──────────────────────────────
  otpCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_email", ["email"]),

  // ─── Platform Stats (Aggregated) ─────────────────────────────────
  platformStats: defineTable({
    key: v.string(),
    value: v.string(),
    numericValue: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),

  // ─── Three Roles Section (Landing) ────────────────────────────────
  rolesSection: defineTable({
    key: v.string(), // singleton: "threeRoles"
    headlineId: v.string(),
    headlineEn: v.string(),
    subtitleId: v.string(),
    subtitleEn: v.string(),
    cards: v.array(
      v.object({
        key: v.string(),
        titleId: v.string(),
        titleEn: v.string(),
        bullet1Id: v.string(),
        bullet1En: v.string(),
        bullet2Id: v.string(),
        bullet2En: v.string(),
        bullet3Id: v.string(),
        bullet3En: v.string(),
        ctaId: v.string(),
        ctaEn: v.string(),
        href: v.string(),
        image: v.string(),
        order: v.number(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ─── Footer Content (Brand Section) ──────────────────────────────
  footerContent: defineTable({
    key: v.string(), // singleton: "brand"
    brandName: v.string(),
    descriptionId: v.string(),
    descriptionEn: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ─── About Page Content (Editable /tentang) ───────────────────────
  // Verifikator dashboard publishes copy + 6 services + 6 why-cards
  // for the public /tentang page. Hero image and per-card images use
  // Cloudinary URLs uploaded via /api/cloudinary-upload.
  aboutContent: defineTable({
    key: v.string(), // singleton: "default"
    heroImage: v.optional(v.string()),
    heroTitleId: v.string(),
    heroTitleEn: v.string(),
    heroSubtitleId: v.string(),
    heroSubtitleEn: v.string(),
    apaItuTitleId: v.string(),
    apaItuTitleEn: v.string(),
    apaItuParagraph1Id: v.string(),
    apaItuParagraph1En: v.string(),
    apaItuParagraph2Id: v.string(),
    apaItuParagraph2En: v.string(),
    missionId: v.string(),
    missionEn: v.string(),
    visionId: v.string(),
    visionEn: v.string(),
    services: v.array(
      v.object({
        iconKey: v.string(), // e.g. "Sprout", "Leaf" — maps to lucide name
        titleId: v.string(),
        titleEn: v.string(),
        descId: v.string(),
        descEn: v.string(),
        image: v.optional(v.string()), // optional Cloudinary URL
      })
    ),
    whyCards: v.array(
      v.object({
        iconKey: v.string(),
        titleId: v.string(),
        titleEn: v.string(),
        descId: v.string(),
        descEn: v.string(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ─── Landing Hero (Editable Copy + Hero Image) ────────────────────
  // Single editable record (key="default") used by HeroSection.tsx on
  // the landing page. Verifikator dashboard updates here flow to the
  // public homepage in real-time via Convex live queries.
  landingHero: defineTable({
    key: v.string(),
    image: v.string(), // Cloudinary secure_url
    badgeId: v.string(),
    badgeEn: v.string(),
    headlineLine1Id: v.string(),
    headlineLine1En: v.string(),
    headlineLine2Id: v.string(),
    headlineLine2En: v.string(),
    headlineAccentId: v.string(),
    headlineAccentEn: v.string(),
    subheadId: v.string(),
    subheadEn: v.string(),
    primaryCtaLabelId: v.string(),
    primaryCtaLabelEn: v.string(),
    primaryCtaHref: v.string(),
    secondaryCtaLabelId: v.string(),
    secondaryCtaLabelEn: v.string(),
    secondaryCtaHref: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ─── FAQ Content (Editable /faq) ──────────────────────────────────
  // Verifikator dapat edit daftar tanya-jawab tanpa redeploy. Items
  // adalah array (urutan tampil = urutan array). Bahasa ID & EN.
  faqContent: defineTable({
    key: v.string(), // singleton: "default"
    heroTitleId: v.string(),
    heroTitleEn: v.string(),
    heroSubtitleId: v.string(),
    heroSubtitleEn: v.string(),
    items: v.array(
      v.object({
        questionId: v.string(),
        questionEn: v.string(),
        answerId: v.string(),
        answerEn: v.string(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ─── Partner Organizations (NGO Whitelist) ────────────────────────
  // NGO/akademisi/koperasi yang di-whitelist sebagai facilitator untuk
  // proyek Pokmaswas. Stage 11 strategic decision: 3-tier partnership
  // model (Direct, NGO-Mediated, Corporate-Sponsored).
  partnerOrganizations: defineTable({
    name: v.string(),
    legalName: v.string(),
    type: v.union(
      v.literal("ngo"),
      v.literal("akademisi"),
      v.literal("pemerintah_daerah"),
      v.literal("koperasi")
    ),
    capabilities: v.array(v.string()),
    contactEmail: v.string(),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("aktif"),
      v.literal("review"),
      v.literal("nonaktif")
    ),
    whitelistedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // ─── KYC Documents (Verification Documents) ───────────────────────
  kycDocuments: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("KTP"),
      v.literal("NIB"),
      v.literal("NPWP"),
      v.literal("Akta"),
      v.literal("SIUP"),
      v.literal("Lainnya")
    ),
    documentName: v.string(),
    fileId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("Menunggu"),
      v.literal("Disetujui"),
      v.literal("Ditolak")
    ),
    reviewNote: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    submittedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),
});
