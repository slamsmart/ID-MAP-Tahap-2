import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import bcrypt from "bcryptjs";
import { requireAdmin, requireOwnerOrAdmin } from "./authz";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Password hashing — Convex V8 isolate jalankan bcryptjs (pure JS).
// Cost factor 10 = ~10ms hash di server, balance keamanan vs latency.
// Hash bcrypt selalu mulai dengan "$2a$" / "$2b$" — kita pakai prefix
// ini untuk auto-detect legacy plaintext (untuk migrasi smooth).
const BCRYPT_COST = 10;
const isHashed = (s: string) => s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$");
function hashPassword(plain: string): string {
  if (isHashed(plain)) return plain; // already hashed (idempotent)
  return bcrypt.hashSync(plain, BCRYPT_COST);
}
function verifyPassword(plain: string, stored: string): boolean {
  if (!isHashed(stored)) {
    // Legacy plaintext fallback — direct compare, tapi LOG sebagai debt
    // marker. Setelah login berhasil, mutation login akan otomatis
    // re-hash password ke bcrypt untuk migrasi gradual.
    return plain === stored;
  }
  try {
    return bcrypt.compareSync(plain, stored);
  } catch {
    return false;
  }
}

// ─── Shared Validator ──────────────────────────────────────────────

async function genReferralCode(ctx: MutationCtx, name: string): Promise<string> {
  const base = (name || "SHB")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 12; attempt++) {
    let suffix = "";
    for (let i = 0; i < 4; i++) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const code = `${base}${suffix}`;
    const clash = await ctx.db
      .query("users")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", code))
      .first();
    if (!clash) return code;
  }
  return `${base}${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

async function ensureUserReferralCode(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<string> {
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
  if (user.referralCode) return user.referralCode;
  const code = await genReferralCode(ctx, user.name);
  await ctx.db.patch(userId, { referralCode: code });
  return code;
}

const roleValidator = v.union(
  v.literal("sahabat"),
  v.literal("mitra"),
  v.literal("mitra_facilitator"),
  v.literal("verifikator"),
  v.literal("admin"),
  v.literal("corporate")
);

// Public-safe user shape — JANGAN ekspor field `password` ke client.
// Validator ini dipakai untuk SEMUA query/mutation public yang return
// user. Strip terjadi di handler via `toPublicUser()`.
const publicUserValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  email: v.string(),
  name: v.string(),
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

type RawUser = {
  _id: any;
  _creationTime: number;
  email: string;
  name: string;
  password: string;
  role: any;
  kycStatus?: any;
  phone?: string;
  organization?: string;
  address?: string;
  createdAt: number;
};

function toPublicUser(u: RawUser) {
  return {
    _id: u._id,
    _creationTime: u._creationTime,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt ?? u._creationTime,
    ...(u.kycStatus !== undefined ? { kycStatus: u.kycStatus } : {}),
    ...(u.phone !== undefined ? { phone: u.phone } : {}),
    ...(u.organization !== undefined ? { organization: u.organization } : {}),
    ...(u.address !== undefined ? { address: u.address } : {}),
  };
}

// ─── Queries ───────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("users").collect();
    return rows.map(toPublicUser);
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const u = await ctx.db.get(args.userId);
    return u ? toPublicUser(u) : null;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return u ? toPublicUser(u) : null;
  },
});

export const listByRole = query({
  args: { role: roleValidator },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    return rows.map(toPublicUser);
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
    const byRole = async (role: string) =>
      (await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", role as never)).collect()).length;
    const byKyc = async (status: string) =>
      (await ctx.db.query("users").withIndex("by_kycStatus", (q) => q.eq("kycStatus", status as never)).collect()).length;

    const [sahabat, mitra, mitraFacilitator, verifikator, admin, corporate,
           kycMenunggu, kycTerverifikasi, kycDitolak] = await Promise.all([
      byRole("sahabat"), byRole("mitra"), byRole("mitra_facilitator"),
      byRole("verifikator"), byRole("admin"), byRole("corporate"),
      byKyc("menunggu"), byKyc("terverifikasi"), byKyc("ditolak"),
    ]);
    return {
      total: sahabat + mitra + mitraFacilitator + verifikator + admin + corporate,
      sahabat, mitra, verifikator, admin, corporate,
      kycMenunggu, kycTerverifikasi, kycDitolak,
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
    referredByCode: v.optional(v.string()), // kode referral pengajak
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

    const hashedPassword = hashPassword(args.password);

    // Resolve referral code → pengajak (jangan boleh self/invalid).
    let referredBy: import("./_generated/dataModel").Id<"users"> | undefined;
    if (args.referredByCode) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referralCode", (q) =>
          q.eq("referralCode", args.referredByCode!.toUpperCase())
        )
        .first();
      if (referrer) referredBy = referrer._id;
    }

    const { referredByCode: _drop, ...userArgs } = args;
    const userId = await ctx.db.insert("users", {
      ...userArgs,
      password: hashedPassword,
      kycStatus: needsKyc ? "belum" : undefined,
      ...(referredBy ? { referredBy } : {}),
      points: 0,
      checkInStreak: 0,
      checkInTotal: 0,
      seedlingsCheckin: 0,
      createdAt: Date.now(),
    });

    // Generate kode referral unik untuk user baru.
    await ensureUserReferralCode(ctx, userId);

    return userId;
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) return null;

    const ok = verifyPassword(args.password, user.password);
    if (!ok) return null;

    // Lazy migration: kalau password masih plaintext (legacy seed),
    // re-hash ke bcrypt setelah login berhasil sehingga next login
    // sudah pakai compare yang aman.
    if (!isHashed(user.password)) {
      const newHash = hashPassword(args.password);
      await ctx.db.patch(user._id, { password: newHash });
      return toPublicUser({ ...user, password: newHash });
    }

    return toPublicUser(user);
  },
});

export const ensureDemoAccount = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("sahabat"), v.literal("mitra")),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const demoAccounts: Record<
      string,
      { password: string; name: string; role: "sahabat" | "mitra" }
    > = {
      "user@idmap.id": {
        password: "user123",
        name: "Andi Pratama",
        role: "sahabat",
      },
      "mitra@idmap.id": {
        password: "mitra123",
        name: "Mitra Proyek Mangrove",
        role: "mitra",
      },
    };
    const demo = demoAccounts[email];

    if (
      !demo ||
      args.password !== demo.password ||
      args.name !== demo.name ||
      args.role !== demo.role
    ) {
      throw new ConvexError({
        code: "INVALID_DEMO_ACCOUNT",
        message: "Akun demo tidak valid.",
      });
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      const patched = {
        ...existing,
        email,
        name: demo.name,
        password: hashPassword(demo.password),
        role: demo.role,
      };
      await ctx.db.patch(existing._id, {
        name: demo.name,
        password: patched.password,
        role: demo.role,
      });
      return toPublicUser(patched);
    }

    const userId = await ctx.db.insert("users", {
      email,
      name: demo.name,
      password: hashPassword(demo.password),
      role: demo.role,
      kycStatus: "belum",
      points: 0,
      checkInStreak: 0,
      checkInTotal: 0,
      seedlingsCheckin: 0,
      createdAt: Date.now(),
    });
    await ensureUserReferralCode(ctx, userId);

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Gagal membuat akun demo.");
    return toPublicUser(user);
  },
});

export const update = mutation({
  args: {
    actorId: v.id("users"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Hanya pemilik atau admin yang boleh update profile.
    await requireOwnerOrAdmin(ctx, args.actorId, args.userId);

    const { actorId: _a, userId, ...updates } = args;
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

// Reset password via OTP — dipanggil HANYA dari /api/auth/reset-password
// (server route Next.js) setelah verify OTP. Mutation ini tidak verify
// OTP sendiri; server route harus call api.otpCodes.verifyOtp dulu.
export const resetPasswordByEmail = mutation({
  args: { email: v.string(), newPassword: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.newPassword.length < 6) {
      throw new ConvexError("Password minimal 6 karakter.");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) {
      throw new ConvexError("Email tidak terdaftar.");
    }
    await ctx.db.patch(user._id, { password: hashPassword(args.newPassword) });
    return null;
  },
});

export const remove = mutation({
  args: {
    actorId: v.id("users"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorId);
    await ctx.db.delete(args.userId);
    return null;
  },
});
