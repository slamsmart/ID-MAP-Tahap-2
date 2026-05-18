import { query } from "./_generated/server";
import { v } from "convex/values";

const certValidator = v.object({
  _id: v.id("certificates"),
  _creationTime: v.number(),
  ownerId: v.id("users"),
  projectId: v.id("projects"),
  type: v.union(v.literal("carbon_credit"), v.literal("contribution")),
  co2Amount: v.number(),
  issuedAt: v.number(),
  certificateNumber: v.string(),
});

export const listByOwner = query({
  args: { ownerId: v.id("users") },
  returns: v.array(certValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: {},
  returns: v.array(certValidator),
  handler: async (ctx) => {
    return await ctx.db.query("certificates").order("desc").collect();
  },
});
