import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import bcrypt from "bcryptjs";

// Password hashing — Convex V8 isolate jalankan bcryptjs (pure JS).
// Cost factor 10 = ~10ms hash di server, balance keamanan vs latency.
// Hash bcrypt selalu mulai dengan "$2a$" / "$2b$" — kita pakai prefix
// ini untuk auto-detect legacy plaintext (untuk migrasi smooth).
const BCRYPT_COST = 10;
const isHashed = (s: string) => s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$");
async function hashPassword(plain: string): Promise<string> {
  if (isHashed(plain)) return plain; // already hashed (idempotent)
  return await bcrypt.hash(plain, BCRYPT_COST);
}
async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!isHashed(stored)) {
    // Legacy plaintext fallback — direct compare, tapi LOG sebagai debt
    // marker. Setelah login berhasil, mutation login akan otomatis
    // re-hash password ke bcrypt untuk migrasi gradual.
    return plain === stored;
  }
  return await bcrypt.compare(plain, stored);
}

// ─── Shared Validator ──────────────────────────────────────────────

const roleValidator = v.union(
  v.literal("sahabat"),
  v.literal("mitra"),
  v.literal("verifikator"),
  v.literal("admin"),
  v.literal("corporate")
);

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  email: v.string(),
  name: v.string(),
  password: v.string(),
  role: roleValidator,
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
  args: { role: roleValidator },
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
    corporate: v.number(),
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
      corporate: all.filter((u) => u.role === "corporate").length,
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
    role: roleValidator,
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

    const needsKyc = args.role === "sahabat" || args.role === "mitra" || args.role === "verifikator" || args.role === "corporate";

    const hashedPassword = await hashPassword(args.password);

    return await ctx.db.insert("users", {
      ...args,
      password: hashedPassword,
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

    if (!user) return null;

    const ok = await verifyPassword(args.password, user.password);
    if (!ok) return null;

    // Lazy migration: kalau password masih plaintext (legacy seed),
    // re-hash ke bcrypt setelah login berhasil sehingga next login
    // sudah pakai compare yang aman.
    if (!isHashed(user.password)) {
      const newHash = await hashPassword(args.password);
      await ctx.db.patch(user._id, { password: newHash });
      return { ...user, password: newHash };
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
