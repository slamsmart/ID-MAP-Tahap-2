import { NextResponse } from "next/server";
import { rateLimitBackend, rateLimitAsync, rateLimitInitError } from "@/lib/rateLimit";

// Debug endpoint untuk verify rate limit setup di production.
// PUBLIC by design — no PII, no sensitive info.
export async function GET() {
  const backend = rateLimitBackend();
  const initError = rateLimitInitError();

  // Test live ke Redis dengan limit ketat 5/30sec — kalau Redis sungguh
  // jalan, panggilan ke-6 dalam 30 detik harus return ok=false.
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
    },
  });
}


