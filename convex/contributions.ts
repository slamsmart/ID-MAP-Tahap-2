import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const contribValidator = v.object({
  _id: v.id("contributions"),
  _creationTime: v.number(),
  userId: v.optional(v.id("users")),
  projectId: v.id("projects"),
  amount: v.number(),
  co2Equivalent: v.number(),
  method: v.union(
    v.literal("QRIS"),
    v.literal("Transfer"),
    v.literal("CSR")
  ),
  paymentId: v.optional(v.string()),
  paymentStatus: v.optional(v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("failed")
  )),
  createdAt: v.number(),
});

// ─── Queries ───────────────────────────────────────────────────────

export const list = query({
  args: {},
  returns: v.array(contribValidator),
  handler: async (ctx) => {
    return await ctx.db.query("contributions").order("desc").collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(contribValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contributions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getUserImpact = query({
  args: { userId: v.id("users") },
  returns: v.object({
    totalContributions: v.number(),
    totalAmount: v.number(),
    totalCo2: v.number(),
    projectsSupported: v.number(),
  }),
  handler: async (ctx, args) => {
    const contribs = await ctx.db
      .query("contributions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const uniqueProjects = new Set(contribs.map((c) => c.projectId));
    return {
      totalContributions: contribs.length,
      totalAmount: contribs.reduce((s, c) => s + c.amount, 0),
      totalCo2: contribs.reduce((s, c) => s + c.co2Equivalent, 0),
      projectsSupported: uniqueProjects.size,
    };
  },
});

export const getCommunityStats = query({
  args: {},
  returns: v.object({
    totalDonors: v.number(),
    totalAmount: v.number(),
    totalCo2: v.number(),
  }),
  handler: async (ctx) => {
    const all = await ctx.db.query("contributions").collect();
    const uniqueUsers = new Set(all.map((c) => c.userId).filter(Boolean));
    return {
      totalDonors: uniqueUsers.size,
      totalAmount: all.reduce((s, c) => s + c.amount, 0),
      totalCo2: all.reduce((s, c) => s + c.co2Equivalent, 0),
    };
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

export const create = mutation({
  args: {
    userId: v.optional(v.id("users")),
    projectId: v.id("projects"),
    amount: v.number(),
    co2Equivalent: v.number(),
    method: v.union(
      v.literal("QRIS"),
      v.literal("Transfer"),
      v.literal("CSR")
    ),
  },
  returns: v.id("contributions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contributions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Buat donasi QRIS dengan status pending (sebelum pembayaran dikonfirmasi)
export const createPending = mutation({
  args: {
    userId: v.optional(v.id("users")),
    projectId: v.id("projects"),
    amount: v.number(),
    co2Equivalent: v.number(),
    paymentId: v.optional(v.string()),
  },
  returns: v.id("contributions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contributions", {
      userId: args.userId,
      projectId: args.projectId,
      amount: args.amount,
      co2Equivalent: args.co2Equivalent,
      method: "QRIS",
      paymentId: args.paymentId,
      paymentStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

// Lampirkan paymentId setelah Mayar create invoice (dipanggil dari /api/payment/create-invoice)
export const attachPaymentId = mutation({
  args: {
    contributionId: v.id("contributions"),
    paymentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contributionId, { paymentId: args.paymentId });
    return null;
  },
});

// Konfirmasi pembayaran (dipanggil dari webhook mayar.id atau simulasi)
export const confirmPayment = mutation({
  args: {
    contributionId: v.id("contributions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const contrib = await ctx.db.get(args.contributionId);
    if (!contrib) return null;
    // Idempotent: only increment funding once per contribution
    if (contrib.paymentStatus === "paid") return null;

    await ctx.db.patch(args.contributionId, { paymentStatus: "paid" });

    // Increment funding raised on the linked project
    const project = await ctx.db.get(contrib.projectId);
    if (project) {
      const next = (project.fundingRaised ?? 0) + contrib.amount;
      await ctx.db.patch(contrib.projectId, { fundingRaised: next });
    }

    // Auto-issue certificate (only if donor is a registered user)
    if (contrib.userId) {
      await ctx.db.insert("certificates", {
        ownerId: contrib.userId,
        projectId: contrib.projectId,
        type: "contribution",
        co2Amount: contrib.co2Equivalent,
        issuedAt: Date.now(),
        certificateNumber: `IDMAP-DON-${Date.now().toString(36).toUpperCase()}-${contrib._id.slice(-6).toUpperCase()}`,
      });
    }
    return null;
  },
});

// Konfirmasi via paymentId (untuk webhook mayar.id yang hanya tahu paymentId)
export const confirmByPaymentId = mutation({
  args: {
    paymentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const contrib = await ctx.db
      .query("contributions")
      .withIndex("by_paymentId", (q) => q.eq("paymentId", args.paymentId))
      .first();
    if (!contrib) return null;
    // Idempotent: only increment funding once per contribution
    if (contrib.paymentStatus === "paid") return null;

    await ctx.db.patch(contrib._id, { paymentStatus: "paid" });

    // Increment funding raised on the linked project
    const project = await ctx.db.get(contrib.projectId);
    if (project) {
      const next = (project.fundingRaised ?? 0) + contrib.amount;
      await ctx.db.patch(contrib.projectId, { fundingRaised: next });
    }

    // Auto-issue certificate (only if donor is a registered user)
    if (contrib.userId) {
      await ctx.db.insert("certificates", {
        ownerId: contrib.userId,
        projectId: contrib.projectId,
        type: "contribution",
        co2Amount: contrib.co2Equivalent,
        issuedAt: Date.now(),
        certificateNumber: `IDMAP-DON-${Date.now().toString(36).toUpperCase()}-${contrib._id.slice(-6).toUpperCase()}`,
      });
    }
    return null;
  },
});

// Lookup status singkat untuk polling dari halaman donasi
export const getStatus = query({
  args: { contributionId: v.id("contributions") },
  returns: v.union(
    v.object({
      paymentStatus: v.optional(
        v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"))
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.contributionId);
    if (!c) return null;
    return { paymentStatus: c.paymentStatus };
  },
});
