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
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_mitra", ["mitraId"])
    .index("by_status_and_created", ["status", "createdAt"]),

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
