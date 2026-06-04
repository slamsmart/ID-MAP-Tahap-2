import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.auth.send-otp");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const { email: rawEmail, name } = await req.json();

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email diperlukan." }, { status: 400 });
    }

    // Normalize agar key OTP konsisten dengan record user (yang juga lowercase di /api/auth/register)
    const email = rawEmail.trim().toLowerCase();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    // Dual rate limit: email-bound (5/jam) + IP-bound (15/jam) untuk
    // mencegah penyerang putar email berbeda dari satu IP/botnet kecil
    // → habiskan kuota Gmail/Resend.
    const [emailRl, ipRl] = await Promise.all([
      rateLimitAsync({
        bucket: "otp:email",
        key: email,
        limit: 5,
        windowMs: 60 * 60 * 1000,
      }),
      rateLimitAsync({
        bucket: "otp:ip",
        key: ip,
        limit: 15,
        windowMs: 60 * 60 * 1000,
      }),
    ]);
    if (!emailRl.ok || !ipRl.ok) {
      const retryAfterMs = Math.max(emailRl.retryAfterMs, ipRl.retryAfterMs);
      const minutes = Math.ceil(retryAfterMs / 60_000);
      log.warn("otp_rate_limited", { email, ip, retryAfterMs });
      return NextResponse.json(
        { error: `Terlalu banyak permintaan OTP. Coba lagi dalam ${minutes} menit.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      log.error("smtp_not_configured");
      return NextResponse.json(
        { error: "Konfigurasi email server belum siap." },
        { status: 500 }
      );
    }

    const code = await convex.mutation(api.otpCodes.createOtp, { email });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"ID-MAP" <${gmailUser}>`,
      to: email,
      subject: `${code} - Kode Verifikasi ID-MAP`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:28px;font-weight:900;color:#0f3d2e;letter-spacing:-1px">ID-MAP</span>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">Verifikasi Email Anda</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
            Halo ${name ?? ""}! Gunakan kode berikut untuk menyelesaikan pendaftaran:
          </p>
          <div style="background:#fff;border:2px solid #d1fae5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#065f46">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
            Kode berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini ke siapapun.
          </p>
        </div>
      `,
    });

    log.info("otp_sent", { email, durationMs: Date.now() - startedAt });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    log.error("send_otp_exception", { err: err as Error });
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status: 500 });
  }
}
