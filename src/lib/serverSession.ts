// Server-side session helpers — pakai Next.js cookies() API. HttpOnly +
// Secure (di prod) + SameSite=Lax. Pakai ini di route handlers,
// middleware, dan server components.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type SessionPayload,
  createSessionToken,
  verifySessionToken,
  type CreateSessionInput,
} from "./sessionToken";

export function getServerSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function setServerSession(input: CreateSessionInput): SessionPayload {
  const { token, payload } = createSessionToken(input);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return payload;
}

export function clearServerSession(): void {
  cookies().delete(SESSION_COOKIE);
}

// ─── Guards ─────────────────────────────────────────────────────────
//
// Pola pakai di route handler:
//
//   const guard = requireSession();
//   if (guard.error) return guard.error;
//   const session = guard.session;
//
// Atau dengan role check:
//
//   const guard = requireRole(["admin", "verifikator"]);
//   if (guard.error) return guard.error;

type Role = SessionPayload["role"];

export function requireSession():
  | { session: SessionPayload; error: null }
  | { session: null; error: NextResponse } {
  const session = getServerSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export function requireRole(allowedRoles: Role[]):
  | { session: SessionPayload; error: null }
  | { session: null; error: NextResponse } {
  const guard = requireSession();
  if (guard.error) return guard;
  if (!allowedRoles.includes(guard.session.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return guard;
}

