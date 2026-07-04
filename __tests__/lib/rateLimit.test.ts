import { describe, it, expect } from "vitest";
import {
  rateLimit,
  rateLimitAsync,
  rateLimitBackend,
} from "../../src/lib/rateLimit";

describe("rateLimit (synchronous in-memory)", () => {
  const opts = { bucket: "test", key: "user-1", limit: 3, windowMs: 60_000 };

  it("request pertama -> ok, remaining = limit-1", () => {
    const res = rateLimit(opts);
    expect(res.ok).toBe(true);
    expect(res.remaining).toBe(opts.limit - 1);
    expect(res.retryAfterMs).toBe(0);
  });

  it("mencapai limit -> ok = false", () => {
    for (let i = 0; i < opts.limit - 1; i++) rateLimit(opts);
    const res = rateLimit(opts);
    expect(res.ok).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.retryAfterMs).toBeGreaterThan(0);
  });

  it("bucket berbeda tidak saling mempengaruhi", () => {
    const a = rateLimit({ bucket: "bucket-a", key: "x", limit: 2, windowMs: 60_000 });
    const b = rateLimit({ bucket: "bucket-b", key: "x", limit: 2, windowMs: 60_000 });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });

  it("key berbeda dalam bucket sama tidak saling mempengaruhi", () => {
    const a = rateLimit({ bucket: "shared", key: "user1", limit: 1, windowMs: 60_000 });
    const b = rateLimit({ bucket: "shared", key: "user2", limit: 1, windowMs: 60_000 });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });
});

describe("rateLimitAsync (fallback in-memory)", () => {
  it("request pertama -> ok", async () => {
    const res = await rateLimitAsync({ bucket: "async-test", key: "ip-1", limit: 5, windowMs: 60_000 });
    expect(res.ok).toBe(true);
    expect(res.remaining).toBe(4);
  });

  it("memblokir setelah limit tercapai", async () => {
    const opts = { bucket: "async-block", key: "ip-2", limit: 2, windowMs: 60_000 };
    expect((await rateLimitAsync(opts)).ok).toBe(true);
    expect((await rateLimitAsync(opts)).ok).toBe(true);
    const res = await rateLimitAsync(opts);
    expect(res.ok).toBe(false);
  });
});

describe("rateLimitBackend", () => {
  it("return 'memory' saat Redis tidak dikonfigurasi", () => {
    const origUrl = process.env.UPSTASH_REDIS_REST_URL;
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(rateLimitBackend()).toBe("memory");
    if (origUrl) process.env.UPSTASH_REDIS_REST_URL = origUrl;
    if (origToken) process.env.UPSTASH_REDIS_REST_TOKEN = origToken;
  });
});