import { query, mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { writeAuditLog } from "./audit";
import { requireRole } from "./authz";

function amountMatchesExpected(expected: number, actual?: number) {
  if (typeof actual !== "number" || actual <= 0) return true;
  return actual >= expected && actual <= expected * 1.05 + 100;
}

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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Queries Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export const list = query({
  args: { actorId: v.id("users") },
  returns: v.array(contribValidator),
  handler: async (ctx, args) => {
    await requireRole(ctx, args.actorId, ["admin", "verifikator"]);
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Mutations Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
    const contributionId = await ctx.db.insert("contributions", {
      ...args,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      actorId: args.userId,
      action: "contribution.create",
      entityType: "contributions",
      entityId: contributionId,
      source: "convex",
      after: { ...args, paymentStatus: undefined },
    });
    return contributionId;
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
    const contributionId = await ctx.db.insert("contributions", {
      userId: args.userId,
      projectId: args.projectId,
      amount: args.amount,
      co2Equivalent: args.co2Equivalent,
      method: "QRIS",
      paymentId: args.paymentId,
      paymentStatus: "pending",
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      actorId: args.userId,
      action: "contribution.create_pending",
      entityType: "contributions",
      entityId: contributionId,
      source: "api",
      after: {
        projectId: args.projectId,
        amount: args.amount,
        co2Equivalent: args.co2Equivalent,
        method: "QRIS",
        paymentStatus: "pending",
      },
      metadata: { hasPaymentId: Boolean(args.paymentId) },
    });
    return contributionId;
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
    const before = await ctx.db.get(args.contributionId);
    await ctx.db.patch(args.contributionId, { paymentId: args.paymentId });
    await writeAuditLog(ctx, {
      actorId: before?.userId,
      action: "contribution.attach_payment_id",
      entityType: "contributions",
      entityId: args.contributionId,
      source: "api",
      before: before ? { paymentId: before.paymentId } : undefined,
      after: { paymentId: args.paymentId },
    });
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
    return await confirmMatchedContribution(ctx, args.contributionId);
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
    if (!contrib) {
      await writeAuditLog(ctx, {
        action: "contribution.webhook_match_miss",
        entityType: "contributions",
        entityId: args.paymentId,
        source: "webhook",
        after: { paymentId: args.paymentId },
      });
      return null;
    }
    return await confirmMatchedContribution(ctx, contrib._id);
  },
});

export const confirmByPaymentIds = mutation({
  args: {
    paymentIds: v.array(v.string()),
    amount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ids = args.paymentIds.map((id) => id.trim()).filter(Boolean);
    let contrib = null;
    let matchedBy: "paymentId" | "amount+recent" | null = null;

    for (const id of ids) {
      contrib = await ctx.db
        .query("contributions")
        .withIndex("by_paymentId", (q) => q.eq("paymentId", id))
        .first();
      if (contrib) {
        matchedBy = "paymentId";
        break;
      }
    }

    if (!contrib && typeof args.amount === "number" && args.amount > 0) {
      // Perluas window menjadi 24 jam agar webhook yang sangat telat (Mayar
      // retry, antrian Vercel, dsb) tetap bisa matched. Ambil 200 row agar
      // robust terhadap traffic tinggi, lalu filter JS-side.
      const recent = await ctx.db.query("contributions").order("desc").take(200);
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      contrib = recent.find((item) =>
        item.paymentStatus === "pending" &&
        item.method === "QRIS" &&
        // Allow webhook gross amount to be up to 5% above stored net (Mayar admin fee)
        args.amount! >= item.amount &&
        args.amount! <= item.amount * 1.05 + 100 &&
        item.createdAt >= cutoff
      ) ?? null;
      if (contrib) {
        matchedBy = "amount+recent";
        if (ids[0]) {
          await ctx.db.patch(contrib._id, { paymentId: ids[0] });
        }
        await writeAuditLog(ctx, {
          actorId: contrib.userId,
          action: "contribution.webhook_match_fallback",
          entityType: "contributions",
          entityId: contrib._id,
          source: "webhook",
          before: { paymentId: contrib.paymentId, paymentStatus: contrib.paymentStatus },
          after: { matchedBy, paymentId: ids[0] ?? null, amount: args.amount ?? null },
        });
      }
    }

    if (!contrib) {
      await writeAuditLog(ctx, {
        action: "contribution.webhook_match_miss",
        entityType: "contributions",
        entityId: ids[0] ?? "unknown",
        source: "webhook",
        after: { paymentIds: ids, amount: args.amount ?? null },
      });
      return null;
    }

    return await confirmMatchedContribution(ctx, contrib._id, args.amount);
  },
});
export const confirmPaymentForContribution = mutation({
  args: {
    contributionId: v.id("contributions"),
    amount: v.optional(v.number()),
    paymentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const contrib = await ctx.db.get(args.contributionId);
    if (!contrib) return null;
    if (contrib.paymentStatus === "paid") return null;
    if (!amountMatchesExpected(contrib.amount, args.amount)) {
      return null;
    }
    if (args.paymentId && args.paymentId.trim().length > 0) {
      await ctx.db.patch(args.contributionId, { paymentId: args.paymentId.trim() });
    }
    return await confirmMatchedContribution(ctx, args.contributionId, args.amount);
  },
});
export const confirmPaymentFromWebhook = mutation({
  args: {
    contributionId: v.id("contributions"),
    paymentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const contrib = await ctx.db.get(args.contributionId);
    if (!contrib) return null;

    if (args.paymentId && contrib.paymentId && args.paymentId !== contrib.paymentId) {
      await ctx.db.patch(contrib._id, { paymentId: args.paymentId });
    }
    return await confirmMatchedContribution(ctx, contrib._id, args.amount);
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


export const getStatusDetail = query({
  args: { contributionId: v.id("contributions") },
  returns: v.union(
    v.object({
      paymentStatus: v.optional(
        v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"))
      ),
      paymentId: v.optional(v.string()),
      amount: v.number(),
      createdAt: v.number(),
      method: v.union(v.literal("QRIS"), v.literal("Transfer"), v.literal("CSR")),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.contributionId);
    if (!c) return null;
    return {
      paymentStatus: c.paymentStatus,
      paymentId: c.paymentId,
      amount: c.amount,
      createdAt: c.createdAt,
      method: c.method,
    };
  },
});

async function confirmMatchedContribution(
  ctx: MutationCtx,
  contributionId: Id<"contributions">,
  amount?: number
) {
  const contrib = await ctx.db.get(contributionId);
  if (!contrib) return null;
  if (contrib.paymentStatus === "paid") return null;
  if (!amountMatchesExpected(contrib.amount, amount)) {
    return null;
  }

  const existingCertificate = contrib.userId
    ? await ctx.db
        .query("certificates")
        .withIndex("by_owner", (q) => q.eq("ownerId", contrib.userId!))
        .filter((q) =>
          q.and(
            q.eq(q.field("projectId"), contrib.projectId),
            q.eq(q.field("type"), "contribution")
          )
        )
        .first()
    : null;

  await ctx.db.patch(contributionId, { paymentStatus: "paid" });
  await writeAuditLog(ctx, {
    actorId: contrib.userId,
    action: "contribution.confirm_payment",
    entityType: "contributions",
    entityId: contributionId,
    source: "webhook",
    before: { paymentStatus: contrib.paymentStatus ?? "pending" },
    after: { paymentStatus: "paid" },
    metadata: {
      projectId: contrib.projectId,
      amount: contrib.amount,
      paymentId: contrib.paymentId,
    },
  });

  const project = await ctx.db.get(contrib.projectId);
  if (project) {
    const next = (project.fundingRaised ?? 0) + contrib.amount;
    await ctx.db.patch(contrib.projectId, { fundingRaised: next });
    await writeAuditLog(ctx, {
      actorId: contrib.userId,
      action: "project.funding_raised_update",
      entityType: "projects",
      entityId: contrib.projectId,
      source: "webhook",
      before: { fundingRaised: project.fundingRaised ?? 0 },
      after: { fundingRaised: next },
      metadata: { contributionId },
    });
  }

  if (contrib.userId && !existingCertificate) {
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
}


export const debugRecentPending = query({
  args: { amount: v.optional(v.number()) },
  returns: v.array(contribValidator),
  handler: async (ctx, args) => {
    const recent = await ctx.db.query("contributions").order("desc").take(30);
    return recent.filter((item) =>
      item.paymentStatus === "pending" &&
      item.method === "QRIS" &&
      (typeof args.amount === "number" ? item.amount === args.amount : true)
    );
  },
});





