import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Generate a 6-digit OTP code and store it (expires in 10 minutes)
export const createOtp = mutation({
  args: { email: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Delete any existing OTP for this email
    const existing = await ctx.db
      .query("otpCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    for (const otp of existing) {
      await ctx.db.delete(otp._id);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await ctx.db.insert("otpCodes", {
      email: args.email,
      code,
      expiresAt,
      used: false,
    });

    return code;
  },
});

// Verify OTP code — returns true if valid, throws if invalid/expired
export const verifyOtp = mutation({
  args: { email: v.string(), code: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const otp = await ctx.db
      .query("otpCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!otp) {
      throw new ConvexError("Kode OTP tidak ditemukan. Minta kode baru.");
    }
    if (otp.used) {
      throw new ConvexError("Kode OTP sudah digunakan.");
    }
    if (Date.now() > otp.expiresAt) {
      await ctx.db.delete(otp._id);
      throw new ConvexError("Kode OTP sudah kedaluwarsa. Minta kode baru.");
    }
    if (otp.code !== args.code) {
      throw new ConvexError("Kode OTP salah.");
    }

    // Mark as used
    await ctx.db.patch(otp._id, { used: true });
    return true;
  },
});
