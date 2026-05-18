import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  title: v.string(),
  location: v.string(),
  province: v.string(),
  image: v.string(),
  status: v.union(
    v.literal("Draft"),
    v.literal("Dalam Proses"),
    v.literal("Terverifikasi")
  ),
  co2Absorption: v.number(),
  area: v.optional(v.number()),
  seedsPlanted: v.optional(v.number()),
  mitraId: v.optional(v.id("users")),
  progress: v.optional(v.number()),
  srnStatus: v.optional(
    v.union(v.literal("Belum"), v.literal("Pending"), v.literal("Terdaftar"))
  ),
  description: v.optional(v.string()),
  createdAt: v.number(),
});

// ─── Queries ───────────────────────────────────────────────────────

export const list = query({
  args: {},
  returns: v.array(projectValidator),
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const listVerified = query({
  args: {},
  returns: v.array(projectValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "Terverifikasi"))
      .collect();
  },
});

export const listByMitra = query({
  args: { mitraId: v.id("users") },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_mitra", (q) => q.eq("mitraId", args.mitraId))
      .collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalProjects: v.number(),
    verifiedProjects: v.number(),
    inProgressProjects: v.number(),
    totalCo2: v.number(),
    totalSeeds: v.number(),
  }),
  handler: async (ctx) => {
    const all = await ctx.db.query("projects").collect();
    const verified = all.filter((p) => p.status === "Terverifikasi");
    const inProgress = all.filter((p) => p.status === "Dalam Proses");

    return {
      totalProjects: all.length,
      verifiedProjects: verified.length,
      inProgressProjects: inProgress.length,
      totalCo2: all.reduce((sum, p) => sum + p.co2Absorption, 0),
      totalSeeds: all.reduce((sum, p) => sum + (p.seedsPlanted ?? 0), 0),
    };
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    location: v.string(),
    province: v.string(),
    image: v.string(),
    co2Absorption: v.number(),
    area: v.optional(v.number()),
    seedsPlanted: v.optional(v.number()),
    mitraId: v.optional(v.id("users")),
    description: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      status: "Draft",
      progress: 0,
      srnStatus: "Belum",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Draft"),
        v.literal("Dalam Proses"),
        v.literal("Terverifikasi")
      )
    ),
    co2Absorption: v.optional(v.number()),
    progress: v.optional(v.number()),
    srnStatus: v.optional(
      v.union(v.literal("Belum"), v.literal("Pending"), v.literal("Terdaftar"))
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(projectId, cleanUpdates);
    }
    return null;
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Proyek tidak ditemukan",
      });
    }
    await ctx.db.delete(args.projectId);
    return null;
  },
});
