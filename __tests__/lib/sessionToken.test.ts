import { describe, it, expect, beforeAll } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "../../src/lib/sessionToken";
import crypto from "node:crypto";

// Set SESSION_SECRET sebelum import — createSessionToken butuh ini di prod.
const TEST_SECRET = "test-secret-32-chars-minimum-for-hmac!!";
beforeAll(() => {
  process.env.SESSION_SECRET = TEST_SECRET;
});

const mockUser = {
  uid: "test-user-id-123",
  email: "andi@idmap.id",
  name: "Andi Pratama",
  role: "sahabat" as const,
};

describe("createSessionToken", () => {
  it("menghasilkan token format base64.base64 (2 part dipisah titik)", () => {
    const { token } = createSessionToken(mockUser);
    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(parts[1]).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("payload berisi uid, email, name, role, iat, exp", () => {
    const { payload } = createSessionToken(mockUser);
    expect(payload.uid).toBe(mockUser.uid);
    expect(payload.email).toBe(mockUser.email);
    expect(payload.name).toBe(mockUser.name);
    expect(payload.role).toBe(mockUser.role);
    expect(payload.iat).toBeTypeOf("number");
    expect(payload.exp).toBeTypeOf("number");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("exp = iat + default TTL (7 hari)", () => {
    const before = Date.now();
    const { payload } = createSessionToken(mockUser);
    const after = Date.now();
    const expectedMs = 7 * 24 * 60 * 60 * 1000;
    // +/- 100ms toleransi eksekusi
    expect(payload.exp - payload.iat).toBeGreaterThanOrEqual(expectedMs - 100);
    expect(payload.exp - payload.iat).toBeLessThanOrEqual(expectedMs + 100);
  });
});

describe("verifySessionToken", () => {
  it("mengembalikan payload untuk token valid", () => {
    const { token } = createSessionToken(mockUser);
    const payload = verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.email).toBe(mockUser.email);
  });

  it("mengembalikan null untuk token null / undefined", () => {
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("mengembalikan null untuk token bukan string", () => {
    expect(verifySessionToken(123 as unknown as string)).toBeNull();
  });

  it("mengembalikan null untuk token dengan format salah (bukan 2 part)", () => {
    expect(verifySessionToken("invalid-token-no-dot")).toBeNull();
    expect(verifySessionToken("too.many.parts")).toBeNull();
  });

  it("mengembalikan null saat signature di-tamper (HMAC mismatch)", () => {
    const { token } = createSessionToken(mockUser);
    const [payloadB64] = token.split(".");
    const tamperedSig = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const tamperedToken = `${payloadB64}.${tamperedSig}`;
    expect(verifySessionToken(tamperedToken)).toBeNull();
  });

  it("mengembalikan null saat payload diubah (integrity rusak)", () => {
    const { token: origToken } = createSessionToken(mockUser);
    // Buat payload baru dengan uid berbeda, sign dengan key berbeda
    const badPayload = btoa(
      JSON.stringify({ ...mockUser, uid: "hacker-id" })
    ).replace(/=+$/, "");
    // Signature dari token asli tidak cocok dengan payload baru
    const sig = origToken.split(".")[1];
    const tamperedToken = `${badPayload}.${sig}`;
    expect(verifySessionToken(tamperedToken)).toBeNull();
  });

  it("mengembalikan null untuk token expired", () => {
    // Token dengan exp di masa lalu (iat also past)
    const expiredInput = {
      uid: "x", email: "x@x", name: "x", role: "sahabat" as const, ttlMs: -1000,
    };
    const { token } = createSessionToken(expiredInput);
    // verifySessionToken cek Date.now() > exp — tunggu 5ms agar pasti expired
    const payload = verifySessionToken(token);
    expect(payload).toBeNull();
  });
});

describe("constants", () => {
  it("SESSION_COOKIE = 'idmap_sess'", () => {
    expect(SESSION_COOKIE).toBe("idmap_sess");
  });
  it("SESSION_TTL_SECONDS adalah angka positif", () => {
    expect(SESSION_TTL_SECONDS).toBeGreaterThan(0);
  });
});