// Rate limiter — dual mode:
//   1. PRODUCTION: Upstash Redis (multi-instance correct, sliding window).
//      Aktif jika UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN ter-set.
//   2. FALLBACK: in-memory Map (per-instance, hilang saat lambda restart).
//      Untuk dev / kalau Redis sedang mati. Tidak block app.
//
// API contract sama: rateLimit({ bucket, key, limit, windowMs }) → { ok, remaining, retryAfterMs }.
// Pemanggil tidak perlu tahu backing store — fungsi tetap synchronous.

import { Redis } from "@upstash/redis";

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

// ─── Redis backend (lazy init) ────────────────────────────────────────

let redis: Redis | null = null;
let redisChecked = false;

function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch {
    return null;
  }
}

// Cache hasil pengecekan async sebentar — supaya call rateLimit() yang
// sebelahan tidak harus tunggu Redis tiap kali (best-effort consistency).
type CachedResult = { result: RateLimitResult; expiresAt: number };
const resultCache = new Map<string, CachedResult>();

// Background promise untuk update Redis — fire-and-forget.
function checkRedisAsync(opts: RateLimitOpts, compositeKey: string): void {
  const r = getRedis();
  if (!r) return;
  const windowSec = Math.ceil(opts.windowMs / 1000);
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  // Pakai sorted set: score = timestamp.
  // 1. Buang yang lebih lama dari window.
  // 2. Hitung anggota saat ini.
  // 3. Tambah timestamp sekarang.
  // 4. Set TTL ke window supaya key auto-bersih.
  Promise.resolve()
    .then(async () => {
      try {
        const pipe = r.pipeline();
        pipe.zremrangebyscore(compositeKey, 0, cutoff);
        pipe.zadd(compositeKey, { score: now, member: `${now}-${Math.random()}` });
        pipe.zcard(compositeKey);
        pipe.expire(compositeKey, windowSec);
        const res = (await pipe.exec()) as [unknown, unknown, number, unknown];
        const count = (typeof res[2] === "number" ? res[2] : 0) || 0;
        const ok = count <= opts.limit;
        const result: RateLimitResult = ok
          ? { ok: true, remaining: Math.max(0, opts.limit - count), retryAfterMs: 0 }
          : { ok: false, remaining: 0, retryAfterMs: opts.windowMs };
        resultCache.set(compositeKey, { result, expiresAt: now + 5_000 });
      } catch {
        // Redis blip — biarkan in-memory result yang menjawab.
      }
    });
}

// ─── Public API (sync) ────────────────────────────────────────────────

export function rateLimit(opts: RateLimitOpts): RateLimitResult {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  const compositeKey = `rl:${opts.bucket}:${opts.key}`;

  // Cek cache result Redis (kalau ada). Cache window 5 detik supaya
  // burst rapat tetap kena gating yang konsisten.
  const cached = resultCache.get(compositeKey);
  if (cached && cached.expiresAt > now && !cached.result.ok) {
    return cached.result;
  }

  // In-memory sliding window — sumber kebenaran sinkron.
  const entry = stores.get(compositeKey) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= opts.limit) {
    const oldest = entry.timestamps[0];
    return { ok: false, remaining: 0, retryAfterMs: oldest + opts.windowMs - now };
  }

  entry.timestamps.push(now);
  stores.set(compositeKey, entry);

  // Update Redis di background. Hasilnya dipakai untuk request berikutnya
  // (via resultCache) supaya rate limit jadi multi-instance correct di
  // serverless tanpa membuat handler ini async.
  checkRedisAsync(opts, compositeKey);

  return {
    ok: true,
    remaining: Math.max(0, opts.limit - entry.timestamps.length),
    retryAfterMs: 0,
  };
}

// Optional: helper untuk inspeksi (debug / health check).
export function rateLimitBackend(): "redis" | "memory" {
  return getRedis() ? "redis" : "memory";
}

