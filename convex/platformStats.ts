import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("platformStats"),
      _creationTime: v.number(),
      key: v.string(),
      value: v.string(),
      numericValue: v.optional(v.number()),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("platformStats").collect();
  },
});

export const getByKey = query({
  args: { key: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("platformStats"),
      _creationTime: v.number(),
      key: v.string(),
      value: v.string(),
      numericValue: v.optional(v.number()),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformStats")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});
