import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

const DEMO_ACCOUNTS = {
  "user@idmap.id": {
    password: "user123",
    name: "Andi Pratama",
    role: "sahabat" as const,
  },
  "mitra@idmap.id": {
    password: "mitra123",
    name: "Mitra Proyek Mangrove",
    role: "mitra" as const,
  },
};

function publicUser(u: any) {
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

export const ensureDemoSession = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const demo = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    if (!demo || args.password !== demo.password) {
      throw new ConvexError("INVALID_DEMO_LOGIN");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: demo.name,
        password: demo.password,
        role: demo.role,
        createdAt: existing.createdAt ?? existing._creationTime,
        kycStatus: "terverifikasi",
      });
      return publicUser({ ...existing, name: demo.name, password: demo.password, role: demo.role, kycStatus: "terverifikasi" });
    }

    const userId = await ctx.db.insert("users", {
      email,
      name: demo.name,
      password: demo.password,
      role: demo.role,
      kycStatus: "terverifikasi",
      points: 0,
      checkInStreak: 0,
      checkInTotal: 0,
      seedlingsCheckin: 0,
      createdAt: Date.now(),
    });
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("DEMO_CREATE_FAILED");
    return publicUser(user);
  },
});

export const getDemoUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    return user ? publicUser(user) : null;
  },
});

export const ping = query({
  args: {},
  handler: async () => "ok",
});
