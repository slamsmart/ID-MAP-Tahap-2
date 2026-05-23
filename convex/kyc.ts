import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// ─── Shared Validator ──────────────────────────────────────────────

const kycDocValidator = v.object({
  _id: v.id("kycDocuments"),
  _creationTime: v.number(),
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
});

// ─── Queries ───────────────────────────────────────────────────────

/** List all KYC documents for a specific user */
export const listByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(kycDocValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kycDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/** List all pending KYC documents (for admin review queue) */
export const listPending = query({
  args: {},
  returns: v.array(
    v.object({
      doc: kycDocValidator,
      userName: v.string(),
      userEmail: v.string(),
      userRole: v.string(),
      userOrganization: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const pendingDocs = await ctx.db
      .query("kycDocuments")
      .withIndex("by_status", (q) => q.eq("status", "Menunggu"))
      .collect();

    const results = [];
    for (const doc of pendingDocs) {
      const user = await ctx.db.get(doc.userId);
      if (user) {
        results.push({
          doc,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          userOrganization: user.organization,
        });
      }
    }
    return results;
  },
});

/** List all KYC documents with user info (admin full view) */
export const listAll = query({
  args: {},
  returns: v.array(
    v.object({
      doc: kycDocValidator,
      userName: v.string(),
      userEmail: v.string(),
      userRole: v.string(),
      userOrganization: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const allDocs = await ctx.db
      .query("kycDocuments")
      .order("desc")
      .collect();

    const results = [];
    for (const doc of allDocs) {
      const user = await ctx.db.get(doc.userId);
      if (user) {
        results.push({
          doc,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          userOrganization: user.organization,
        });
      }
    }
    return results;
  },
});

/** Get aggregate KYC status for a user */
export const getUserKycStatus = query({
  args: { userId: v.id("users") },
  returns: v.object({
    status: v.union(
      v.literal("belum"),
      v.literal("menunggu"),
      v.literal("terverifikasi"),
      v.literal("ditolak")
    ),
    totalDocuments: v.number(),
    approved: v.number(),
    pending: v.number(),
    rejected: v.number(),
  }),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("kycDocuments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (docs.length === 0) {
      return { status: "belum" as const, totalDocuments: 0, approved: 0, pending: 0, rejected: 0 };
    }

    const approved = docs.filter((d) => d.status === "Disetujui").length;
    const pending = docs.filter((d) => d.status === "Menunggu").length;
    const rejected = docs.filter((d) => d.status === "Ditolak").length;

    let status: "belum" | "menunggu" | "terverifikasi" | "ditolak";
    if (rejected > 0) {
      status = "ditolak";
    } else if (pending > 0) {
      status = "menunggu";
    } else if (approved >= 2) {
      // Minimum 2 documents approved (KTP + NIB)
      status = "terverifikasi";
    } else {
      status = "menunggu";
    }

    return { status, totalDocuments: docs.length, approved, pending, rejected };
  },
});

/** KYC statistics for admin dashboard */
export const getStats = query({
  args: {},
  returns: v.object({
    totalSubmissions: v.number(),
    pending: v.number(),
    approved: v.number(),
    rejected: v.number(),
  }),
  handler: async (ctx) => {
    const allDocs = await ctx.db.query("kycDocuments").collect();
    return {
      totalSubmissions: allDocs.length,
      pending: allDocs.filter((d) => d.status === "Menunggu").length,
      approved: allDocs.filter((d) => d.status === "Disetujui").length,
      rejected: allDocs.filter((d) => d.status === "Ditolak").length,
    };
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

/** Submit a new KYC document */
export const submitDocument = mutation({
  args: {
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
  },
  returns: v.id("kycDocuments"),
  handler: async (ctx, args) => {
    // Verify user exists and is mitra or perusahaan
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
    }
    if (user.role !== "mitra" && user.role !== "verifikator") {
      throw new ConvexError({
        code: "INVALID_ROLE",
        message: "Hanya mitra dan verifikator yang perlu KYC",
      });
    }

    const docId = await ctx.db.insert("kycDocuments", {
      userId: args.userId,
      type: args.type,
      documentName: args.documentName,
      fileId: args.fileId,
      status: "Menunggu",
      submittedAt: Date.now(),
    });

    // Update user kycStatus to "menunggu"
    if (user.kycStatus !== "menunggu" && user.kycStatus !== "terverifikasi") {
      await ctx.runMutation(internal.users.updateKycStatus, {
        userId: args.userId,
        kycStatus: "menunggu",
      });
    }

    return docId;
  },
});

/** Admin reviews (approve/reject) a KYC document */
export const reviewDocument = mutation({
  args: {
    documentId: v.id("kycDocuments"),
    status: v.union(v.literal("Disetujui"), v.literal("Ditolak")),
    reviewNote: v.optional(v.string()),
    reviewedBy: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Dokumen tidak ditemukan" });
    }

    // Update document status
    await ctx.db.patch(args.documentId, {
      status: args.status,
      reviewNote: args.reviewNote,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
    });

    // Recalculate user KYC status
    const allDocs = await ctx.db
      .query("kycDocuments")
      .withIndex("by_user", (q) => q.eq("userId", doc.userId))
      .collect();

    // Apply the current review to the in-memory list
    const updatedDocs = allDocs.map((d) =>
      d._id === args.documentId ? { ...d, status: args.status } : d
    );

    const approved = updatedDocs.filter((d) => d.status === "Disetujui").length;
    const pending = updatedDocs.filter((d) => d.status === "Menunggu").length;
    const rejected = updatedDocs.filter((d) => d.status === "Ditolak").length;

    let newKycStatus: "menunggu" | "terverifikasi" | "ditolak";
    if (rejected > 0) {
      newKycStatus = "ditolak";
    } else if (pending > 0) {
      newKycStatus = "menunggu";
    } else if (approved >= 2) {
      newKycStatus = "terverifikasi";
    } else {
      newKycStatus = "menunggu";
    }

    await ctx.runMutation(internal.users.updateKycStatus, {
      userId: doc.userId,
      kycStatus: newKycStatus,
    });

    return null;
  },
});

/** Delete a KYC document (by user, only if still pending) */
export const deleteDocument = mutation({
  args: { documentId: v.id("kycDocuments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Dokumen tidak ditemukan" });
    }
    if (doc.status !== "Menunggu") {
      throw new ConvexError({
        code: "ALREADY_REVIEWED",
        message: "Dokumen yang sudah direview tidak bisa dihapus",
      });
    }
    await ctx.db.delete(args.documentId);
    return null;
  },
});
