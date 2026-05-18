import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const txValidator = v.object({
  _id: v.id("transactions"),
  _creationTime: v.number(),
  companyName: v.string(),
  companyId: v.optional(v.id("users")),
  projectId: v.optional(v.id("projects")),
  co2Amount: v.number(),
  pricePerTon: v.number(),
  totalAmount: v.number(),
  status: v.union(
    v.literal("Pending"),
    v.literal("Selesai"),
    v.literal("Gagal")
  ),
  createdAt: v.number(),
});

// ─── Queries ───────────────────────────────────────────────────────

export const list = query({
  args: {},
  returns: v.array(txValidator),
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").collect();
  },
});

export const listByCompany = query({
  args: { companyId: v.id("users") },
  returns: v.array(txValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();
  },
});

export const getPortfolioStats = query({
  args: { companyId: v.id("users") },
  returns: v.object({
    totalCo2Claimed: v.number(),
    totalSpent: v.number(),
    totalCertificates: v.number(),
  }),
  handler: async (ctx, args) => {
    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const completed = txs.filter((t) => t.status === "Selesai");
    return {
      totalCo2Claimed: completed.reduce((s, t) => s + t.co2Amount, 0),
      totalSpent: completed.reduce((s, t) => s + t.totalAmount, 0),
      totalCertificates: completed.length,
    };
  },
});

export const getTotalStats = query({
  args: {},
  returns: v.object({
    totalTransactions: v.number(),
    totalAmount: v.number(),
  }),
  handler: async (ctx) => {
    const txs = await ctx.db.query("transactions").collect();
    const completed = txs.filter((t) => t.status === "Selesai");
    return {
      totalTransactions: completed.length,
      totalAmount: completed.reduce((s, t) => s + t.totalAmount, 0),
    };
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

export const create = mutation({
  args: {
    companyName: v.string(),
    companyId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    co2Amount: v.number(),
    pricePerTon: v.number(),
  },
  returns: v.id("transactions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", {
      ...args,
      totalAmount: args.co2Amount * args.pricePerTon,
      status: "Selesai",
      createdAt: Date.now(),
    });
  },
});
