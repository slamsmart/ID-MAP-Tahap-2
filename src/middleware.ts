// Middleware Next.js — verifikasi cookie sesi server-side untuk
// halaman protected. Reject sebelum render React → tidak ada kebocoran
// data jika cookie hilang/expired.
//
// Edge runtime: tidak bisa import node:crypto, jadi verifikasi pakai
// Web Crypto (HMAC-SHA256). Logika harus mirroring sessionToken.ts.

import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "idmap_sess";

// Map prefix path → role yang diizinkan + halaman login khusus.
// /admin & /verifikator pakai portal login terpisah supaya entry-pointnya
// tidak terekspos di halaman /masuk publik.
const ROUTE_GUARDS: Array<{ prefix: string; roles: string[]; loginPath: string }> = [
  { prefix: "/admin", roles: ["admin"], loginPath: "/masuk-admin" },
  { prefix: "/verifikator", roles: ["verifikator", "admin"], loginPath: "/masuk-verifikator" },
  { prefix: "/mitra", roles: ["mitra", "mitra_facilitator", "admin"], loginPath: "/masuk" },
  { prefix: "/corporate", roles: ["corporate", "admin"], loginPath: "/masuk" },
  { prefix: "/user", roles: ["sahabat", "admin"], loginPath: "/masuk" },
];

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyToken(token: string | undefined, secret: string): Promise<{
  role: string;
  exp: number;
} | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  const expectedSig = b64urlFromBytes(new Uint8Array(expectedBuf));
  if (!timingSafeEq(sig, expectedSig)) return null;

  try {
    const json = new TextDecoder().decode(b64urlDecode(payloadB64));
    const payload = JSON.parse(json);
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (typeof payload.role !== "string") return null;
    return { role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const guard = ROUTE_GUARDS.find((g) => pathname === g.prefix || pathname.startsWith(g.prefix + "/"));
  if (!guard) return NextResponse.next();

  const secret =
    process.env.SESSION_SECRET ??
    "dev-only-insecure-secret-please-set-SESSION_SECRET-in-prod";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token, secret);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = guard.loginPath;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!guard.roles.includes(session.role)) {
    const url = req.nextUrl.clone();
    url.pathname = session.role === "sahabat" ? "/user" : `/${session.role}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/verifikator/:path*",
    "/mitra/:path*",
    "/corporate/:path*",
    "/user/:path*",
  ],
};
