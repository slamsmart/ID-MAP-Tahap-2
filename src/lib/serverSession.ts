// Server-side session helpers — pakai Next.js cookies() API. HttpOnly +
// Secure (di prod) + SameSite=Lax. Pakai ini di route handlers,
// middleware, dan server components.

import { cookies } from "next/headers";
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
