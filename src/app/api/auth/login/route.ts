import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/sessionToken";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.auth.login");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    // Rate limit per email + per IP — keduanya dicek supaya brute-force
    // dari banyak IP ke 1 akun ditolak, dan brute-force dari 1 IP ke
    // banyak akun juga ditolak.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const [emailLimit, ipLimit] = await Promise.all([
      rateLimitAsync({ bucket: "login:email", key: email, limit: 10, windowMs: 15 * 60 * 1000 }),
      rateLimitAsync({ bucket: "login:ip", key: ip, limit: 30, windowMs: 15 * 60 * 1000 }),
    ]);
    if (!emailLimit.ok || !ipLimit.ok) {
      const retryAfterMs = Math.max(emailLimit.retryAfterMs, ipLimit.retryAfterMs);
      log.warn("rate_limited", { email, ip, retryAfterMs });
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const user = await convex.mutation(api.users.login, { email, password });
    if (!user) {
      log.info("login_failed", { email, ip, durationMs: Date.now() - startedAt });
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    const { token } = createSessionToken({
      uid: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      user: { _id: user._id, email: user.email, name: user.name, role: user.role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    log.info("login_ok", { email, role: user.role, durationMs: Date.now() - startedAt });
    return res;
  } catch (err) {
    log.error("login_exception", { err: err as Error });
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
