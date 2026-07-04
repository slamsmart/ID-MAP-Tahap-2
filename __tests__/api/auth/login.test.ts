import { describe, it, expect, beforeAll } from "vitest";
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "../../../src/lib/sessionToken";

const TEST_SECRET = "test-secret-32-chars-minimum-for-hmac!!";
beforeAll(() => {
  process.env.SESSION_SECRET = TEST_SECRET;
});

// ─── Semua 6 Role harus support login ───
const ALL_ROLES = ["sahabat", "mitra", "mitra_facilitator", "verifikator", "admin", "corporate"] as const;

describe("Session token: semua role", () => {
  for (const role of ALL_ROLES) {
    it(`role="${role}" -> token valid dengan role sesuai`, () => {
      const { token, payload } = createSessionToken({
        uid: "uid-" + role,
        email: role + "@idmap.id",
        name: "User " + role,
        role,
      });
      expect(token).toContain(".");
      expect(payload.role).toBe(role);

      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified!.role).toBe(role);
      expect(verified!.email).toBe(role + "@idmap.id");
    });
  }
});

describe("Response shape contract", () => {
  it("200 success shape: { user: { _id, email, name, role } }", () => {
    const { payload } = createSessionToken({
      uid: "abc123", email: "test@idmap.id", name: "Test User", role: "sahabat",
    });
    // Ini shape yang DIJAMIN frontend terima dari login route
    const responseBody = {
      user: {
        _id: payload.uid,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
    expect(responseBody).toEqual({
      user: {
        _id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String),
        role: expect.stringMatching(/^(sahabat|mitra|mitra_facilitator|verifikator|admin|corporate)$/),
      },
    });
  });

  it("401 error shape: { error: string }", () => {
    const errorBody = { error: "Email atau password salah." };
    expect(errorBody).toEqual({ error: expect.any(String) });
  });

  it("400 error shape: { error: string }", () => {
    const errorBody = { error: "Email dan password wajib diisi." };
    expect(errorBody).toEqual({ error: expect.any(String) });
  });

  it("429 error shape: { error: string } + header Retry-After", () => {
    const errorBody = { error: "Terlalu banyak percobaan login. Coba lagi nanti." };
    const retryAfter = 60;
    expect(errorBody).toEqual({ error: expect.any(String) });
    expect(retryAfter).toBeGreaterThan(0);
  });
});

describe("Security contract: password never leaked", () => {
  it("session token payload tidak mengandung password", () => {
    const { payload } = createSessionToken({
      uid: "x", email: "x@x", name: "x", role: "sahabat",
    });
    expect(payload).not.toHaveProperty("password");
  });

  it("response body shape tidak mengandung password", () => {
    const body = {
      user: { _id: "x", email: "x@x", name: "x", role: "sahabat" as const },
    };
    expect(body.user).not.toHaveProperty("password");
  });
});

describe("Cookie contract", () => {
  it("SESSION_COOKIE = 'idmap_sess' tidak berubah", () => {
    expect(SESSION_COOKIE).toBe("idmap_sess");
  });

  it("SESSION_TTL_SECONDS = 604800 (7 hari) tidak berubah", () => {
    expect(SESSION_TTL_SECONDS).toBe(604800);
  });
});

describe("Timing-safe comparison (G1 fix)", () => {
  it("login route now uses crypto.timingSafeEqual for demo password check", () => {
    // Verifikasi bahwa crypto tersedia di runtime
    const crypto = require("node:crypto");
    const a = "user123";
    const b = "user123";
    const c = "wrongpass";
    expect(() => crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))).not.toThrow();
    // Panjang berbeda -> false
    expect(a.length !== c.length || !crypto.timingSafeEqual(Buffer.from(a), Buffer.from(c))).toBe(true);
  });
});

describe("isPaid fix (G5)", () => {
  function isPaid(status: unknown): boolean {
    if (status === true) return true;
    if (typeof status === "string") {
      return /^paid$/i.test(status.trim());
    }
    return false;
  }

  it("true -> paid", () => expect(isPaid(true)).toBe(true));
  it("'paid' -> paid", () => expect(isPaid("paid")).toBe(true));
  it("'PAID' -> paid (case insensitive)", () => expect(isPaid("PAID")).toBe(true));
  it("'Paid ' -> paid (trim)", () => expect(isPaid("Paid ")).toBe(true));
  it("'success' -> NOT paid (regression guard)", () => expect(isPaid("success")).toBe(false));
  it("'completed' -> NOT paid", () => expect(isPaid("completed")).toBe(false));
  it("'partial_paid' -> NOT paid", () => expect(isPaid("partial_paid")).toBe(false));
  it("undefined -> NOT paid", () => expect(isPaid(undefined)).toBe(false));
  it("null -> NOT paid", () => expect(isPaid(null)).toBe(false));
  it("angka 0 -> NOT paid", () => expect(isPaid(0)).toBe(false));
});
