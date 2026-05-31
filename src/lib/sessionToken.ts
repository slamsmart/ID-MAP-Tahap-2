// HMAC-signed session token. Format: base64url(payload).base64url(sig)
// Disimpan sebagai HttpOnly cookie supaya kebal XSS — JS halaman tidak
// bisa baca / curi token. Server selalu jadi sumber kebenaran auth.
//
// Pakai node:crypto (HMAC-SHA256) — tidak butuh dep tambahan. JWT bisa
// di-swap nanti tanpa ubah call site.

import crypto from "crypto";

export interface SessionPayload {
  uid: string;       // user._id (Convex Id)
  email: string;
  name: string;
  role: "sahabat" | "mitra" | "mitra_facilitator" | "verifikator" | "admin" | "corporate";
  iat: number;       // issued-at (ms epoch)
  exp: number;       // expires-at (ms epoch)
}

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  // Fallback dev-only — JANGAN dipakai di production. Build di Vercel
  // wajib set SESSION_SECRET (>= 32 char random).
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET env var harus di-set di production (>=32 char).");
  }
  return "dev-only-insecure-secret-please-set-SESSION_SECRET-in-prod";
}

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function hmac(payloadB64: string): string {
  return b64urlEncode(
    crypto.createHmac("sha256", getSecret()).update(payloadB64).digest()
  );
}

function timingSafeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export interface CreateSessionInput {
  uid: string;
  email: string;
  name: string;
  role: SessionPayload["role"];
  ttlMs?: number;
}

export function createSessionToken(input: CreateSessionInput): {
  token: string;
  payload: SessionPayload;
} {
  const now = Date.now();
  const payload: SessionPayload = {
    uid: input.uid,
    email: input.email,
    name: input.name,
    role: input.role,
    iat: now,
    exp: now + (input.ttlMs ?? DEFAULT_TTL_MS),
  };
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sig = hmac(payloadB64);
  return { token: `${payloadB64}.${sig}`, payload };
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!timingSafeEq(sig, hmac(payloadB64))) return null;
  try {
    const payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "idmap_sess";
export const SESSION_TTL_SECONDS = DEFAULT_TTL_MS / 1000;
