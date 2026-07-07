import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { rateLimitAsync } from "@/lib/rateLimit";
import { getServerSession } from "@/lib/serverSession";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = createLogger("api.auth.change-email-otp");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kirim OTP verifikasi ke email BARU sebelum email user benar-benar
// diganti. Wajib login (session). Throttle triple:
//   - per user (akun yang meminta)  → cegah loop "ganti email" dari 1 akun
//   - per target email              → cegah email-bombing ke 1 korban
//   - per IP                         → cegah botnet putar banyak akun
export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const session = getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { newEmail: rawEmail } = await req.json();
    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email baru diperlukan." }, { status: 400 });
    }

    const newEmail = rawEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(newEmail)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    // Tidak boleh ganti ke email yang sama.
    if (newEmail === session.email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "Email baru sama dengan email saat ini." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    const [userRl, emailRl, ipRl] = await Promise.all([
      rateLimitAsync({
        bucket: "change-email-otp:user",
        key: session.uid,
        limit: 3,
        windowMs: 60 * 60 * 1000,
      }),
      rateLimitAsync({
        bucket: "change-email-otp:email",
        key: newEmail,
        limit: 3,
        windowMs: 60 * 60 * 1000,
      }),
      rateLimitAsync({
        bucket: "change-email-otp:ip",
        key: ip,
        limit: 3,
        windowMs: 60 * 60 * 1000,
      }),
    ]);
    if (!userRl.ok || !emailRl.ok || !ipRl.ok) {
      const retryAfterMs = Math.max(userRl.retryAfterMs, emailRl.retryAfterMs, ipRl.retryAfterMs);
      const minutes = Math.ceil(retryAfterMs / 60_000);
      log.warn("change_email_otp_rate_limited", { uid: session.uid, newEmail, ip, retryAfterMs });
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${minutes} menit.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    // Cegah ambil email orang lain & cegah email-bombing ke korban:
    // kalau email sudah terdaftar, tolak SEBELUM kirim OTP.
    const existing = await convex.query(api.users.getByEmail, { email: newEmail });
    if (existing) {
      log.warn("change_email_otp_duplicate", { newEmail });
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
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

    const code = await convex.mutation(api.otpCodes.createOtp, { email: newEmail });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    const safeName = session.name
      ? session.name.slice(0, 80).replace(/[&<>"']/g, (c) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        }[c] ?? c))
      : "";

    await transporter.sendMail({
      from: `"ID-MAP" <${gmailUser}>`,
      to: newEmail,
      subject: `${code} - Konfirmasi Email Baru ID-MAP`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:28px;font-weight:900;color:#0f3d2e;letter-spacing:-1px">ID-MAP</span>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">Konfirmasi Email Baru</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
            Halo ${safeName}! Gunakan kode berikut untuk menyetujui perubahan email akun ID-MAP Anda ke alamat ini.
          </p>
          <div style="background:#fff;border:2px solid #d1fae5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#065f46">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
            Kode berlaku selama <strong>10 menit</strong>. Jika Anda tidak meminta perubahan ini, abaikan email ini.
          </p>
        </div>
      `,
    });

    log.info("change_email_otp_sent", { uid: session.uid, newEmail, durationMs: Date.now() - startedAt });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    log.error("change_email_otp_exception", { err: err as Error });
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
