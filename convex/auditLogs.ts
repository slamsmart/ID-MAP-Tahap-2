import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authz";

const auditLogValidator = v.object({
  _id: v.id("auditLogs"),
  _creationTime: v.number(),
  actorId: v.optional(v.id("users")),
  actorRole: v.optional(v.string()),
  action: v.string(),
  entityType: v.string(),
  entityId: v.string(),
  source: v.union(
    v.literal("api"),
    v.literal("convex"),
    v.literal("webhook"),
    v.literal("system")
  ),
  before: v.optional(v.string()),
  after: v.optional(v.string()),
  metadata: v.optional(v.string()),
  createdAt: v.number(),
});

export const listRecent = query({
  args: {
    actorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  returns: v.array(auditLogValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorId);
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_created")
      .order("desc")
      .take(Math.min(args.limit ?? 50, 200));
  },
});

export const listByEntity = query({
  args: {
    actorId: v.id("users"),
    entityType: v.string(),
    entityId: v.string(),
  },
  returns: v.array(auditLogValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorId);
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .order("desc")
      .collect();
  },
});
