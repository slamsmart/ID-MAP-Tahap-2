import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { rateLimitAsync } from "@/lib/rateLimit";
import { getServerSession, setServerSession } from "@/lib/serverSession";
import { createLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = createLogger("api.auth.change-email");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getConvexErrorMessage(err: unknown, fallback = ""): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const data = "data" in err ? (err as { data?: unknown }).data : undefined;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }
  return fallback;
}

// Finalisasi ganti email: verify OTP (ke email baru) lalu ubah email di DB
// dan rotate session cookie agar cookie memuat email terbaru. Wajib login.
export async function POST(req: NextRequest) {
  const session = getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { newEmail: rawEmail, otpCode } = await req.json();
    const newEmail = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const code = typeof otpCode === "string" ? otpCode.trim() : "";

    if (!newEmail || !EMAIL_RE.test(newEmail)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Kode OTP tidak valid. Silakan masukkan 6 digit kode." },
        { status: 400 }
      );
    }

    // Throttle per user — batasi berapa kali finalisasi ganti email
    // dilakukan, meski OTP tiap percobaan sudah dikunci verifyOtp.
    const userRl = await rateLimitAsync({
      bucket: "change-email:user",
      key: session.uid,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!userRl.ok) {
      const minutes = Math.ceil(userRl.retryAfterMs / 60_000);
      log.warn("change_email_rate_limited", { uid: session.uid, retryAfterMs: userRl.retryAfterMs });
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(userRl.retryAfterMs / 1000)) } }
      );
    }

    // Server-side OTP verify (single source of truth). Mark used + bump
    // attempt, jadi tidak bisa replay kode lama.
    try {
      await convex.mutation(api.otpCodes.verifyOtp, { email: newEmail, code });
    } catch (err: unknown) {
      const msg = getConvexErrorMessage(err, "Kode OTP tidak valid.");
      log.warn("change_email_otp_invalid", { uid: session.uid, newEmail, msg });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    try {
      await convex.mutation(api.users.changeEmail, {
        userId: session.uid as Id<"users">,
        newEmail,
      });
    } catch (err: unknown) {
      const msg = getConvexErrorMessage(err);
      if (msg.includes("DUPLICATE_EMAIL") || msg.includes("sudah digunakan")) {
        return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
      }
      if (msg.includes("SAME_EMAIL")) {
        return NextResponse.json({ error: "Email baru sama dengan email saat ini." }, { status: 400 });
      }
      log.error("change_email_exception", { err: err as Error });
      return NextResponse.json({ error: "Gagal mengubah email." }, { status: 500 });
    }

    // Rotate session agar cookie memuat email terbaru.
    setServerSession({
      uid: session.uid,
      email: newEmail,
      name: session.name,
      role: session.role,
    });

    log.info("change_email_ok", { uid: session.uid, newEmail });
    return NextResponse.json({ success: true, email: newEmail });
  } catch (err: unknown) {
    log.error("change_email_handler_exception", { err: err as Error });
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
