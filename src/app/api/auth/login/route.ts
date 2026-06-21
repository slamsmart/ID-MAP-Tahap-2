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
export const dynamic = 'force-dynamic';

const DEMO_ACCOUNTS = {
  "user@idmap.id": {
    password: "user123",
    name: "Andi Pratama",
    role: "sahabat" as const,
  },
  "mitra@idmap.id": {
    password: "mitra123",
    name: "Mitra Proyek Mangrove",
    role: "mitra" as const,
  },
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }
  return String(err);
}

function getErrorData(err: unknown): unknown {
  return typeof err === "object" && err !== null && "data" in err
    ? (err as { data?: unknown }).data
    : undefined;
}

async function ensureDemoLogin(
  email: string,
  password: string,
  demo: (typeof DEMO_ACCOUNTS)[keyof typeof DEMO_ACCOUNTS]
) {
  return convex.mutation(api.users.ensureDemoAccount, {
    email,
    password,
    name: demo.name,
    role: demo.role,
  });
}

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

    const demo = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    let user = null;
    if (demo && demo.password === password) {
      try {
        user = await convex.mutation(api.demoAuth.ensureDemoSession, {
          email,
          password,
        });
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        log.warn(msg, { email });
        // Fallback ke users.login untuk semua error demo (DUPLICATE_EMAIL,
        // Server Error saat Convex cold-start, dll). Demo password sudah
        // disimpan di DB oleh ensureDemoSession sebelumnya.
        try {
          user = await convex.mutation(api.users.login, { email, password });
          if (!user) user = await ensureDemoLogin(email, password, demo);
        } catch {
          // users.login juga gagal (misal user belum ada) — lempar error asli
          throw err;
        }
      }
    } else {
      user = await convex.mutation(api.users.login, { email, password });
    }
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
    log.error("login_exception", {
      err: err as Error,
      message: err instanceof Error ? err.message : String(err),
      data: getErrorData(err),
    });
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
