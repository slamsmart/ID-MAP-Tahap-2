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
