import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const mrvValidator = v.object({
  _id: v.id("mrvReports"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  period: v.string(),
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
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  returns: v.array(mrvValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mrvReports")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: {},
  returns: v.array(mrvValidator),
  handler: async (ctx) => {
    return await ctx.db.query("mrvReports").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: { 
    reportId: v.id("mrvReports"),
    status: v.union(
      v.literal("Selesai"),
      v.literal("Dalam Proses"),
      v.literal("Menunggu")
    )
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, { status: args.status });
    return null;
  },
});
