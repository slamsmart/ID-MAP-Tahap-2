// Rate limiter — dual API:
//   1. rateLimit()      — synchronous, in-memory only (per-instance)
//   2. rateLimitAsync() — async, Upstash Redis sliding window (multi-instance correct)
//
// Pakai rateLimitAsync() di endpoint kritis (auth, payment, AI). Pakai
// rateLimit() saja kalau performa absolut > strictness (misal endpoint
// internal yang sudah ter-auth).
//
// Kalau env Upstash tidak ter-set, rateLimitAsync() jatuh ke in-memory
// → tetap fungsional, hanya per-instance.

import { Redis } from "@upstash/redis";

interface RateLimitOpts {
  /** Bucket name e.g. "otp" — isolate counters per concern. */
  bucket: string;
  /** Unique key e.g. email atau IP. */
  key: string;
  /** Max calls dalam window. */
  limit: number;
  /** Window dalam milidetik (mis. 60*60*1000 = 1 jam). */
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

// ─── In-memory backend ────────────────────────────────────────────────

type WindowEntry = { timestamps: number[] };
const stores = new Map<string, WindowEntry>();

function rateLimitInMemory(opts: RateLimitOpts): RateLimitResult {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  const compositeKey = `rl:${opts.bucket}:${opts.key}`;

  const entry = stores.get(compositeKey) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= opts.limit) {
    const oldest = entry.timestamps[0];
    return { ok: false, remaining: 0, retryAfterMs: oldest + opts.windowMs - now };
  }

  entry.timestamps.push(now);
  stores.set(compositeKey, entry);

  return {
    ok: true,
    remaining: Math.max(0, opts.limit - entry.timestamps.length),
    retryAfterMs: 0,
  };
}

// ─── Redis backend (lazy init) ────────────────────────────────────────

let redis: Redis | null = null;
let redisChecked = false;
let redisInitError: string | null = null;

function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisInitError = `missing-env url=${Boolean(url)} token=${Boolean(token)}`;
    return null;
  }
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (err) {
    redisInitError = err instanceof Error ? err.message : String(err);
    return null;
  }
}

// Untuk debug only — return alasan kenapa Redis tidak aktif.
export function rateLimitInitError(): string | null {
  // Make sure getRedis() di-call dulu supaya redisInitError ter-set.
  getRedis();
  return redisInitError;
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Synchronous rate limit — pakai in-memory Map.
 * Per-instance state. Multi-instance Vercel = bocor (counter reset di tiap
 * cold start). Pakai rateLimitAsync() untuk endpoint kritis.
 */
export function rateLimit(opts: RateLimitOpts): RateLimitResult {
  return rateLimitInMemory(opts);
}

/**
 * Async rate limit — pakai Redis sliding window kalau env ada,
 * fallback ke in-memory kalau tidak. Multi-instance correct.
 *
 * Pemakaian:
 *   const rl = await rateLimitAsync({ bucket, key, limit, windowMs });
 *   if (!rl.ok) return 429;
 */
export async function rateLimitAsync(opts: RateLimitOpts): Promise<RateLimitResult> {
  const r = getRedis();
  if (!r) {
    // Fallback in-memory
    return rateLimitInMemory(opts);
  }

  const now = Date.now();
  const cutoff = now - opts.windowMs;
  const windowSec = Math.ceil(opts.windowMs / 1000);
  const compositeKey = `rl:${opts.bucket}:${opts.key}`;

  try {
    // Sorted set sliding window:
    //  1. Buang member di luar window
    //  2. Tambah timestamp sekarang
    //  3. Hitung anggota
    //  4. Set TTL supaya key auto-bersih
    const pipe = r.pipeline();
    pipe.zremrangebyscore(compositeKey, 0, cutoff);
    pipe.zadd(compositeKey, { score: now, member: `${now}-${Math.random()}` });
    pipe.zcard(compositeKey);
    pipe.expire(compositeKey, windowSec);
    const res = (await pipe.exec()) as [unknown, unknown, number, unknown];
    const count = typeof res[2] === "number" ? res[2] : 0;

    if (count > opts.limit) {
      // Hapus member yang baru ditambahkan supaya counter tidak overshoot
      // berkelanjutan saat tertolak.
      try {
        const oldestRes = (await r.zrange(compositeKey, 0, 0, { withScores: true })) as
          | [string, number]
          | unknown[];
        const oldestScore = Array.isArray(oldestRes) && typeof oldestRes[1] === "number"
          ? oldestRes[1]
          : now - opts.windowMs;
        return {
          ok: false,
          remaining: 0,
          retryAfterMs: oldestScore + opts.windowMs - now,
        };
      } catch {
        return { ok: false, remaining: 0, retryAfterMs: opts.windowMs };
      }
    }

    return {
      ok: true,
      remaining: Math.max(0, opts.limit - count),
      retryAfterMs: 0,
    };
  } catch {
    // Redis down — fallback in-memory supaya app tetap jalan.
    return rateLimitInMemory(opts);
  }
}

// Optional: helper untuk inspeksi (debug / health check).
export function rateLimitBackend(): "redis" | "memory" {
  return getRedis() ? "redis" : "memory";
}
