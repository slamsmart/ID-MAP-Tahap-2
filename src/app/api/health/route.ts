import { NextResponse } from "next/server";
import { rateLimitBackend, rateLimitAsync } from "@/lib/rateLimit";

// Debug endpoint untuk verify rate limit setup di production.
// Return:
//  - backend: "redis" | "memory" — backing store yang aktif
//  - testKey: hasil rateLimitAsync test counter (limit 100 / 10 detik)
//
// PUBLIC by design — no PII, no sensitive info. Hapus / move ke admin
// kalau khawatir info disclosure.
export async function GET() {
  const backend = rateLimitBackend();
  const testResult = await rateLimitAsync({
    bucket: "_debug:health",
    key: "global",
    limit: 100,
    windowMs: 10_000,
  });

  return NextResponse.json({
    backend,
    rateLimit: {
      ok: testResult.ok,
      remaining: testResult.remaining,
      retryAfterMs: testResult.retryAfterMs,
    },
    timestamp: Date.now(),
    env: {
      hasUpstashUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      hasUpstashToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
      hasTurnstileSecret: Boolean(process.env.TURNSTILE_SECRET_KEY),
      hasTurnstileSiteKey: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
      hasSessionSecret: Boolean(process.env.SESSION_SECRET),
    },
  });
}
