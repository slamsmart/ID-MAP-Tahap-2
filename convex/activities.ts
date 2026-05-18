import { query } from "./_generated/server";
import { v } from "convex/values";

const activityValidator = v.object({
  _id: v.id("systemActivities"),
  _creationTime: v.number(),
  text: v.string(),
  type: v.union(
    v.literal("project"),
    v.literal("transaction"),
    v.literal("user"),
    v.literal("verification"),
    v.literal("system")
  ),
  createdAt: v.number(),
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(activityValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("systemActivities")
      .order("desc")
      .take(limit);
  },
});
