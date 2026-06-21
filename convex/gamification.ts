import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ─── Konstanta aturan ──────────────────────────────────────────────
const POINTS_PER_CHECKIN = 10;
const POINTS_PER_REFERRAL = 50;
const STREAK_PER_SEEDLING = 15; // 15 hari beruntun → 1 bibit
const REFERRALS_PER_SEEDLING = 10; // 10 referral ter-KYC → 1 bibit

// ─── Date helper (Asia/Jakarta, UTC+7) ─────────────────────────────
// Convex query TIDAK boleh pakai Date.now(); client kirim `today`.
// Mutation boleh pakai Date.now() → kita hitung server-side di sana.
function jakartaDateFromMs(ms: number): string {
  const d = new Date(ms + 7 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function prevDate(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Referral code generator (mutation-only: pakai Math.random) ────
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
  // fallback hampir mustahil bentrok
  return `${base}${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

// dipakai juga oleh users.create
export async function ensureReferralCodeFor(
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

// ─── Hitung referral ter-KYC ───────────────────────────────────────
async function countReferrals(ctx: { db: any }, userId: Id<"users">) {
  const referred = await ctx.db
    .query("users")
    .withIndex("by_referredBy", (q: any) => q.eq("referredBy", userId))
    .collect();
  const verified = referred.filter((u: any) => u.kycStatus === "terverifikasi").length;
  const pending = referred.length - verified;
  return { total: referred.length, verified, pending };
}

// ─── Query: data gamifikasi 1 user ─────────────────────────────────
export const getUserGamification = query({
  args: { userId: v.id("users"), today: v.string() },
  returns: v.object({
    referralCode: v.union(v.string(), v.null()),
    points: v.number(),
    checkInStreak: v.number(),
    bestStreak: v.number(),
    checkInTotal: v.number(),
    canCheckInToday: v.boolean(),
    daysToNextCheckinSeedling: v.number(),
    seedlingsCheckin: v.number(),
    verifiedReferralCount: v.number(),
    pendingReferralCount: v.number(),
    referralsToNextSeedling: v.number(),
    seedlingsReferral: v.number(),
    totalSeedlings: v.number(),
    totalPoints: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
    }
    const points = user.points ?? 0;
    const streak = user.checkInStreak ?? 0;
    const seedlingsCheckin = user.seedlingsCheckin ?? 0;
    const { verified, pending } = await countReferrals(ctx, args.userId);
    const seedlingsReferral = Math.floor(verified / REFERRALS_PER_SEEDLING);
    const totalPoints = points + verified * POINTS_PER_REFERRAL;
    const streakRem = streak % STREAK_PER_SEEDLING;
    const refRem = verified % REFERRALS_PER_SEEDLING;

    return {
      referralCode: user.referralCode ?? null,
      points,
      checkInStreak: streak,
      bestStreak: user.bestStreak ?? 0,
      checkInTotal: user.checkInTotal ?? 0,
      canCheckInToday: user.lastCheckInDate !== args.today,
      daysToNextCheckinSeedling:
        streakRem === 0 ? STREAK_PER_SEEDLING : STREAK_PER_SEEDLING - streakRem,
      seedlingsCheckin,
      verifiedReferralCount: verified,
      pendingReferralCount: pending,
      referralsToNextSeedling:
        refRem === 0 ? REFERRALS_PER_SEEDLING : REFERRALS_PER_SEEDLING - refRem,
      seedlingsReferral,
      totalSeedlings: seedlingsCheckin + seedlingsReferral,
      totalPoints,
    };
  },
});

// ─── Mutation: check-in harian ─────────────────────────────────────
export const dailyCheckIn = mutation({
  args: { userId: v.id("users") },
  returns: v.object({
    points: v.number(),
    streak: v.number(),
    awardedSeedling: v.boolean(),
    pointsGained: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
    }
    const today = jakartaDateFromMs(Date.now());

    const existing = await ctx.db
      .query("checkIns")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();
    if (existing) {
      throw new ConvexError({
        code: "ALREADY_CHECKED_IN",
        message: "Kamu sudah check-in hari ini. Datang lagi besok!",
      });
    }

    // Streak: lanjut bila kemarin check-in, else reset ke 1.
    const last = user.lastCheckInDate;
    const newStreak = last === prevDate(today) ? (user.checkInStreak ?? 0) + 1 : 1;
    const newPoints = (user.points ?? 0) + POINTS_PER_CHECKIN;
    const bestStreak = Math.max(user.bestStreak ?? 0, newStreak);
    const checkInTotal = (user.checkInTotal ?? 0) + 1;

    // Bibit dari check-in: tiap kelipatan 15 streak.
    const awardedSeedling = newStreak % STREAK_PER_SEEDLING === 0;
    const seedlingsCheckin =
      (user.seedlingsCheckin ?? 0) + (awardedSeedling ? 1 : 0);

    await ctx.db.patch(args.userId, {
      points: newPoints,
      checkInStreak: newStreak,
      bestStreak,
      lastCheckInDate: today,
      checkInTotal,
      seedlingsCheckin,
    });
    await ctx.db.insert("checkIns", {
      userId: args.userId,
      date: today,
      createdAt: Date.now(),
    });

    return {
      points: newPoints,
      streak: newStreak,
      awardedSeedling,
      pointsGained: POINTS_PER_CHECKIN,
    };
  },
});

// ─── Mutation: pastikan user punya referral code ───────────────────
export const ensureReferralCode = mutation({
  args: { userId: v.id("users") },
  returns: v.string(),
  handler: async (ctx, args) => {
    return await ensureReferralCodeFor(ctx, args.userId);
  },
});

// ─── Query: leaderboard (rank by total poin) ───────────────────────
export const getLeaderboard = query({
  args: {},
  returns: v.array(
    v.object({
      userId: v.id("users"),
      name: v.string(),
      points: v.number(),
      verifiedReferrals: v.number(),
      seedlings: v.number(),
      totalPoints: v.number(),
    })
  ),
  handler: async (ctx) => {
    const sahabat = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "sahabat"))
      .collect();

    const rows = [];
    for (const u of sahabat) {
      const { verified } = await countReferrals(ctx, u._id);
      const points = u.points ?? 0;
      const seedlings =
        (u.seedlingsCheckin ?? 0) + Math.floor(verified / REFERRALS_PER_SEEDLING);
      rows.push({
        userId: u._id,
        name: u.name,
        points,
        verifiedReferrals: verified,
        seedlings,
        totalPoints: points + verified * POINTS_PER_REFERRAL,
      });
    }
    rows.sort((a, b) => b.totalPoints - a.totalPoints);
    return rows.slice(0, 20);
  },
});
