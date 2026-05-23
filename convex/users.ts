import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// ─── Shared Validator ──────────────────────────────────────────────

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  email: v.string(),
  name: v.string(),
  password: v.string(),
  role: v.union(
    v.literal("sahabat"),
    v.literal("mitra"),
    v.literal("verifikator"),
    v.literal("admin")
  ),
  kycStatus: v.optional(
    v.union(
      v.literal("belum"),
      v.literal("menunggu"),
      v.literal("terverifikasi"),
      v.literal("ditolak")
    )
  ),
  phone: v.optional(v.string()),
  organization: v.optional(v.string()),
  address: v.optional(v.string()),
  createdAt: v.number(),
});

// ─── Queries ───────────────────────────────────────────────────────

export const list = query({
  args: {},
  returns: v.array(userValidator),
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const get = query({
  args: { userId: v.id("users") },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const listByRole = query({
  args: {
    role: v.union(
      v.literal("sahabat"),
      v.literal("mitra"),
      v.literal("verifikator"),
      v.literal("admin")
    ),
  },
  returns: v.array(userValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    sahabat: v.number(),
    mitra: v.number(),
    verifikator: v.number(),
    admin: v.number(),
    kycMenunggu: v.number(),
    kycTerverifikasi: v.number(),
    kycDitolak: v.number(),
  }),
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return {
      total: all.length,
      sahabat: all.filter((u) => u.role === "sahabat").length,
      mitra: all.filter((u) => u.role === "mitra").length,
      verifikator: all.filter((u) => u.role === "verifikator").length,
      admin: all.filter((u) => u.role === "admin").length,
      kycMenunggu: all.filter((u) => u.kycStatus === "menunggu").length,
      kycTerverifikasi: all.filter((u) => u.kycStatus === "terverifikasi").length,
      kycDitolak: all.filter((u) => u.kycStatus === "ditolak").length,
    };
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("sahabat"),
      v.literal("mitra"),
      v.literal("verifikator"),
      v.literal("admin")
    ),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new ConvexError({
        code: "DUPLICATE_EMAIL",
        message: "Email sudah terdaftar",
      });
    }

    const needsKyc = args.role === "sahabat" || args.role === "mitra" || args.role === "verifikator";

    return await ctx.db.insert("users", {
      ...args,
      kycStatus: needsKyc ? "belum" : undefined,
      createdAt: Date.now(),
    });
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.password !== args.password) {
      return null;
    }

    return user;
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(userId, cleanUpdates);
    }
    return null;
  },
});

// Internal mutation for updating KYC status (called from kyc.ts)
export const updateKycStatus = internalMutation({
  args: {
    userId: v.id("users"),
    kycStatus: v.union(
      v.literal("belum"),
      v.literal("menunggu"),
      v.literal("terverifikasi"),
      v.literal("ditolak")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { kycStatus: args.kycStatus });
    return null;
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
    return null;
  },
});
