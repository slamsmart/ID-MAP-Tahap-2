import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimitBackend, rateLimitAsync, rateLimitInitError } from "@/lib/rateLimit";

// Health/debug endpoint — gate via ADMIN_API_TOKEN supaya internals
// (Redis url prefix, token length, env flags) tidak public.
//
// Pakai:
//   curl -H "x-admin-token: <ADMIN_API_TOKEN>" https://www.id-map.app/api/health
//
// Tanpa token: respon 200 dengan minimal info (uptime check saja).

function timingSafeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function GET(request: NextRequest) {
  const adminToken = process.env.ADMIN_API_TOKEN ?? "";
  const provided = request.headers.get("x-admin-token") ?? "";
  const isAdmin = adminToken.length >= 16 && timingSafeCompare(provided, adminToken);

  if (!isAdmin) {
    // Public minimal response — uptime check.
    return NextResponse.json({ ok: true, service: "id-map" });
  }

  // Admin: return full diagnostic.
  const backend = rateLimitBackend();
  const initError = rateLimitInitError();

  let testResult = null;
  let redisError: string | null = null;
  try {
    testResult = await rateLimitAsync({
      bucket: "_debug:health",
      key: "global",
      limit: 5,
      windowMs: 30_000,
    });
  } catch (err) {
    redisError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    backend,
    testResult,
    redisError,
    initError,
    timestamp: Date.now(),
    env: {
      hasUpstashUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      hasUpstashToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
      upstashUrlPrefix: process.env.UPSTASH_REDIS_REST_URL?.slice(0, 30),
      upstashTokenLen: process.env.UPSTASH_REDIS_REST_TOKEN?.length,
      hasTurnstileSecret: Boolean(process.env.TURNSTILE_SECRET_KEY),
      hasTurnstileSiteKey: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    },
  });
}



