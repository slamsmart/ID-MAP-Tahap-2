import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

type WebAuthnCredential = {
  credentialId?: unknown;
  publicKey?: unknown;
  counter?: unknown;
  deviceName?: unknown;
  createdAt?: unknown;
};

function getValidCredentials(creds: unknown): Array<{
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceName?: string;
  createdAt: number;
}> {
  if (!Array.isArray(creds)) return [];
  return creds.flatMap((cred: WebAuthnCredential) => {
    if (typeof cred.credentialId !== "string" || cred.credentialId.length === 0) {
      return [];
    }
    return [{
      credentialId: cred.credentialId,
      publicKey: typeof cred.publicKey === "string" ? cred.publicKey : "",
      counter: typeof cred.counter === "number" ? cred.counter : 0,
      ...(typeof cred.deviceName === "string" ? { deviceName: cred.deviceName } : {}),
      createdAt: typeof cred.createdAt === "number" ? cred.createdAt : 0,
    }];
  });
}

// ─── Challenge Management ─────────────────────────────────────────────────────

export const createChallenge = mutation({
  args: {
    challenge: v.string(),
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Clean up expired challenges first
    const now = Date.now();
    const expired = await ctx.db
      .query("webauthnChallenges")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    await Promise.all(expired.map((c) => ctx.db.delete(c._id)));

    return ctx.db.insert("webauthnChallenges", {
      challenge: args.challenge,
      email: args.email,
      userId: args.userId,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes
      used: false,
    });
  },
});

export const consumeChallenge = mutation({
  args: { challenge: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("webauthnChallenges")
      .withIndex("by_challenge", (q) => q.eq("challenge", args.challenge))
      .first();

    if (!row) throw new ConvexError("Challenge tidak ditemukan.");
    if (row.used) throw new ConvexError("Challenge sudah digunakan.");
    if (Date.now() > row.expiresAt) throw new ConvexError("Challenge sudah kadaluarsa.");

    await ctx.db.patch(row._id, { used: true });
    return row;
  },
});

// ─── Credential Registration ──────────────────────────────────────────────────

export const registerCredential = mutation({
  args: {
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    deviceName: v.optional(v.string()),
    visitorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User tidak ditemukan.");

    const existing = user.webauthnCredentials ?? [];

    // Prevent duplicate credential IDs
    if (existing.some((c) => c.credentialId === args.credentialId)) {
      throw new ConvexError("Credential sudah terdaftar untuk akun ini.");
    }

    const newCred = {
      credentialId: args.credentialId,
      publicKey: args.publicKey,
      counter: args.counter,
      deviceName: args.deviceName,
      createdAt: Date.now(),
    };

    await ctx.db.patch(args.userId, {
      webauthnCredentials: [...existing, newCred],
      ...(args.visitorId ? { visitorId: args.visitorId } : {}),
    });

    return { ok: true };
  },
});

export const updateCounter = mutation({
  args: {
    userId: v.id("users"),
    credentialId: v.string(),
    counter: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User tidak ditemukan.");

    const creds = (user.webauthnCredentials ?? []).map((c) =>
      c.credentialId === args.credentialId ? { ...c, counter: args.counter } : c
    );
    await ctx.db.patch(args.userId, { webauthnCredentials: creds });
    return { ok: true };
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getCredentials = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];
    return getValidCredentials(user.webauthnCredentials).map((c) => ({
      credentialId: c.credentialId,
      publicKey: c.publicKey,
      counter: c.counter,
      deviceName: c.deviceName,
      createdAt: c.createdAt,
    }));
  },
});

export const hasWebAuthn = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user) return false;
    return getValidCredentials(user.webauthnCredentials).length > 0;
  },
});

export const getCredentialsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user) return [];
    return getValidCredentials(user.webauthnCredentials).map((c) => c.credentialId);
  },
});

export const getUserByEmailAndCredentialId = query({
  args: { email: v.string(), credentialId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user) return null;

    const matched = getValidCredentials(user.webauthnCredentials).find(
      (c) => c.credentialId === args.credentialId
    );
    if (!matched) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      counter: matched.counter,
    };
  },
});

export const getUserByCredentialId = query({
  args: { credentialId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").take(10000);
    for (const user of users) {
      const creds = getValidCredentials(user.webauthnCredentials);
      const matched = creds.find((c) => c.credentialId === args.credentialId);
      if (matched) {
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          counter: matched.counter,
        };
      }
    }
    return null;
  },
});
