import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  registerWebhook,
  testWebhook,
  isMayarLive,
  MAYAR_BASE,
} from "../../../../lib/mayar";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.payment.register-webhook");

// Admin helper to (re)register the webhook URL with Mayar.
// Protected by ADMIN_API_TOKEN dengan timing-safe compare + audit log.
//
// Usage:
//   POST /api/payment/register-webhook
//     Header  : x-admin-token: <ADMIN_API_TOKEN>
//     Body    : { "urlHook": "https://your-domain/api/payment/webhook", "test": true }

function timingSafeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // Brute-force guard: 10 attempt per jam per IP. Token statik tanpa
  // throttle = ranselt brute-forceable.
  const rl = await rateLimitAsync({
    bucket: "register-webhook:ip",
    key: ip,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    log.warn("register_webhook_rate_limited", { ip });
    return NextResponse.json(
      { error: "Terlalu banyak permintaan." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const adminToken = process.env.ADMIN_API_TOKEN ?? "";
  const provided = request.headers.get("x-admin-token") ?? "";

  if (adminToken.length < 16) {
    log.error("admin_token_misconfigured");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }
  if (!timingSafeCompare(provided, adminToken)) {
    log.warn("register_webhook_auth_failed", { ip });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isMayarLive) {
    return NextResponse.json(
      { error: "MAYAR_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      urlHook: string;
      test?: boolean;
    };
    if (!body.urlHook) {
      return NextResponse.json({ error: "urlHook required" }, { status: 400 });
    }

    const reg = await registerWebhook(body.urlHook);
    let testResult: unknown = null;
    if (body.test) {
      testResult = await testWebhook(body.urlHook);
    }

    log.info("register_webhook_ok", { ip, urlHook: body.urlHook });
    return NextResponse.json({
      success: true,
      base: MAYAR_BASE,
      register: reg,
      test: testResult,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal register webhook";
    log.error("register_webhook_exception", { err: error as Error });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
