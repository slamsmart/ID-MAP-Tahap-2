import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/sessionToken";
import { rateLimitAsync } from "@/lib/rateLimit";
import { verifyTurnstile, isTurnstileEnabled } from "@/lib/turnstile";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.auth.register");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type PublicRegisterRole = "sahabat" | "mitra";

const ALLOWED_ROLES = new Set<PublicRegisterRole>(["sahabat", "mitra"]);

// Public registration is limited to citizen/partner roles. Admin,
// verifier, and corporate accounts must be provisioned through a
// privileged server-side flow, never from a public client request.

function getConvexErrorMessage(err: unknown, fallback = "") {
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

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const ipRl = await rateLimitAsync({
      bucket: "register:ip",
      key: ip,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipRl.ok) {
      log.warn("register_rate_limited_ip", { ip, retryAfterMs: ipRl.retryAfterMs });
      return NextResponse.json(
        { error: "Terlalu banyak pendaftaran dari IP ini. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(ipRl.retryAfterMs / 1000)) } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const requestedRole = typeof body.role === "string" ? body.role : "";
    const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const otpCode = typeof body.otpCode === "string" ? body.otpCode.trim() : "";

    if (!email || !password || !name || !ALLOWED_ROLES.has(requestedRole as PublicRegisterRole)) {
      return NextResponse.json({ error: "Field tidak lengkap." }, { status: 400 });
    }
    const role = requestedRole as PublicRegisterRole;
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: "Kode OTP tidak valid. Silakan masukkan 6 digit kode." },
        { status: 400 }
      );
    }

    // Turnstile CAPTCHA â€” auto-skip di dev (TURNSTILE_SECRET_KEY belum
    // di-set). Block di prod kalau token salah/expired/spoofed.
    if (isTurnstileEnabled()) {
      const verdict = await verifyTurnstile(turnstileToken, ip);
      if (!verdict.ok) {
        log.warn("register_captcha_failed", { ip, reason: verdict.reason });
        return NextResponse.json(
          { error: "Verifikasi CAPTCHA gagal. Coba lagi." },
          { status: 400 }
        );
      }
    }

    // Rate limit per email â€” proteksi terhadap loop dengan 1 IP berputar
    // banyak email random.
    const emailRl = await rateLimitAsync({
      bucket: "register:email",
      key: email,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!emailRl.ok) {
      log.warn("register_rate_limited_email", { email, retryAfterMs: emailRl.retryAfterMs });
      return NextResponse.json(
        { error: "Terlalu banyak percobaan untuk email ini. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(emailRl.retryAfterMs / 1000)) } }
      );
    }

    const phone = typeof body.phone === "string" ? body.phone : undefined;
    const organization = typeof body.organization === "string" ? body.organization : undefined;
    const address = typeof body.address === "string" ? body.address : undefined;
    const partnerType = typeof body.partnerType === "string" ? body.partnerType : undefined;
    const projectLocation = typeof body.projectLocation === "string" ? body.projectLocation.trim() : undefined;
    const referredByCode =
      typeof body.referredByCode === "string"
        ? body.referredByCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16) || undefined
        : undefined;

    if (role === "mitra" && (!partnerType || !projectLocation)) {
      return NextResponse.json(
        { error: "Jenis mitra dan lokasi proyek wajib diisi." },
        { status: 400 }
      );
    }

    // Server-side OTP verify (single source of truth). Mutation ini juga
    // mark `used:true` + bump attempt counter, jadi attacker tidak bisa
    // skip endpoint OTP atau replay kode lama.
    try {
      await convex.mutation(api.otpCodes.verifyOtp, { email, code: otpCode });
    } catch (err: unknown) {
      const msg = getConvexErrorMessage(err, "Kode OTP tidak valid.");
      log.warn("register_otp_invalid", { email, msg });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    let userId: string;
    try {
      userId = await convex.mutation(api.users.create, {
        email,
        password,
        name,
        role,
        ...(phone ? { phone } : {}),
        ...(organization ? { organization } : {}),
        ...(address ? { address } : {}),
        ...(referredByCode ? { referredByCode } : {}),
      });
    } catch (err: unknown) {
      const msg = getConvexErrorMessage(err);
      if (msg.includes("DUPLICATE_EMAIL") || msg.includes("sudah terdaftar")) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
      }
      log.error("register_exception", { err: err as Error });
      return NextResponse.json({ error: "Gagal mendaftar." }, { status: 500 });
    }

    const { token } = createSessionToken({
      uid: userId,
      email,
      name,
      role,
    });

    const res = NextResponse.json({
      user: { _id: userId, email, name, role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    log.info("register_ok", { email, role });
    return res;
  } catch (err) {
    log.error("register_handler_exception", { err: err as Error });
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
