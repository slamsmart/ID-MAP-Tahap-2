import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const MAX_ATTEMPTS = 5;

// Generate a 6-digit OTP code and store it (expires in 10 minutes).
// Hapus semua entri lama untuk email yang sama agar attempt counter tidak
// bisa di-bypass dengan request OTP baru tanpa rate limit.
export const createOtp = mutation({
  args: { email: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("otpCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    for (const otp of existing) {
      await ctx.db.delete(otp._id);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ctx.db.insert("otpCodes", {
      email: args.email,
      code,
      expiresAt,
      used: false,
      attempts: 0,
    });

    return code;
  },
});

// Verify OTP code & mark as used (single-use, brute-force protected).
// Mutation ini HARUS dipanggil dari server route (`/api/auth/register`),
// bukan dari client — supaya tidak ada window di mana OTP sudah verified
// di client tapi server belum mengkonfirmasi sebelum membuat akun.
export const verifyOtp = mutation({
  args: { email: v.string(), code: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const candidates = await ctx.db
      .query("otpCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    const now = Date.now();
    // Pilih OTP terbaru yang belum used & belum expired (race-safe vs `.first()`).
    const otp = candidates
      .filter((o) => !o.used && o.expiresAt > now)
      .sort((a, b) => b._creationTime - a._creationTime)[0];

    if (!otp) {
      throw new ConvexError("Kode OTP tidak ditemukan atau sudah kedaluwarsa. Minta kode baru.");
    }

    if (otp.code !== args.code) {
      const attempts = (otp.attempts ?? 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await ctx.db.delete(otp._id);
        throw new ConvexError(
          "Terlalu banyak percobaan salah. Kode OTP dibatalkan, silakan minta kode baru.",
        );
      }
      await ctx.db.patch(otp._id, { attempts });
      throw new ConvexError("Kode OTP salah.");
    }

    await ctx.db.patch(otp._id, { used: true });
    return true;
  },
});
