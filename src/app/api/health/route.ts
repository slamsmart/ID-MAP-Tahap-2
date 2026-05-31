import { NextResponse } from "next/server";
import { rateLimitBackend, rateLimitAsync, rateLimitInitError } from "@/lib/rateLimit";

// Debug endpoint untuk verify rate limit setup di production.
// PUBLIC by design — no PII, no sensitive info.
export async function GET() {
  const backend = rateLimitBackend();
  const initError = rateLimitInitError();

  // Test live ke Redis dengan key unik
  let redisLive = false;
  let redisError: string | null = null;
  try {
    const result = await rateLimitAsync({
      bucket: "_debug:health",
      key: "global",
      limit: 100,
      windowMs: 10_000,
    });
    redisLive = result.ok;
  } catch (err) {
    redisError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    backend,
    redisLive,
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
      hasSessionSecret: Boolean(process.env.SESSION_SECRET),
    },
  });
}

