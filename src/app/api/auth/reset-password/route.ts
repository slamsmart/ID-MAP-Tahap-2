import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.auth.reset-password");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Reset password via OTP yang sudah dikirim lewat /api/auth/send-otp.
// Flow:
//   1. User isi email di /lupa-password → frontend call /api/auth/send-otp
//      (catch 409 "sudah terdaftar" sebagai signal: user ada → kirim OTP)
//   2. User input OTP + password baru → frontend POST endpoint ini
//   3. Server verify OTP via api.otpCodes.verifyOtp (mark used + counter)
//      → call api.users.resetPasswordByEmail untuk update bcrypt hash
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    const ipRl = await rateLimitAsync({
      bucket: "reset-password:ip",
      key: ip,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipRl.ok) {
      log.warn("reset_rate_limited_ip", { ip, retryAfterMs: ipRl.retryAfterMs });
      return NextResponse.json(
        { error: "Terlalu banyak percobaan dari IP ini. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(ipRl.retryAfterMs / 1000)) } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otpCode = typeof body.otpCode === "string" ? body.otpCode.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json({ error: "Kode OTP tidak valid." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const emailRl = await rateLimitAsync({
      bucket: "reset-password:email",
      key: email,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!emailRl.ok) {
      log.warn("reset_rate_limited_email", { email, retryAfterMs: emailRl.retryAfterMs });
      return NextResponse.json(
        { error: "Terlalu banyak percobaan untuk email ini. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(emailRl.retryAfterMs / 1000)) } }
      );
    }

    try {
      await convex.mutation(api.otpCodes.verifyOtp, { email, code: otpCode });
    } catch (err: any) {
      const msg =
        typeof err?.data === "string"
          ? err.data
          : err?.data?.message ?? err?.message ?? "Kode OTP tidak valid.";
      log.warn("reset_otp_invalid", { email, msg });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    try {
      await convex.mutation(api.users.resetPasswordByEmail, { email, newPassword });
    } catch (err: any) {
      const msg =
        typeof err?.data === "string"
          ? err.data
          : err?.data?.message ?? err?.message ?? "Gagal reset password.";
      log.warn("reset_user_failed", { email, msg });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    log.info("reset_password_ok", { email });
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("reset_handler_exception", { err: err as Error });
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
