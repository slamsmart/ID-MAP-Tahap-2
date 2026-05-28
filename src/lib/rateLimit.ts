// In-memory rate limiter — sederhana, no external deps. Cukup untuk
// submission Tahap 2 dan demo juri. Untuk production scale, migrate ke
// Upstash Redis (sudah ada free tier 10K req/hari).
//
// Pattern: sliding window per key, simpan timestamps di Map global.
// Server restart = reset (acceptable untuk demo, harm minimal).

type WindowEntry = { timestamps: number[] };

const stores = new Map<string, WindowEntry>();

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

export function rateLimit(opts: RateLimitOpts): RateLimitResult {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  const compositeKey = `${opts.bucket}:${opts.key}`;

  const entry = stores.get(compositeKey) ?? { timestamps: [] };
  // Drop expired timestamps (sliding window)
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= opts.limit) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + opts.windowMs - now;
    return { ok: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  stores.set(compositeKey, entry);

  return {
    ok: true,
    remaining: opts.limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}
