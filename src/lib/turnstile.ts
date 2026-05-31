// Cloudflare Turnstile verify helper.
// Pakai server-side untuk validasi token Turnstile sebelum action sensitif
// (register, donate, dll).
//
// Mode opt-in via env: kalau TURNSTILE_SECRET_KEY tidak ter-set,
// `verifyTurnstile()` auto-return true → tidak block app saat dev/setup.

import { createLogger } from "./logger";

const log = createLogger("lib.turnstile");

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev mode / belum di-setup: skip verify supaya app tetap bisa dipakai.
    return { ok: true };
  }

  if (!token || typeof token !== "string") {
    return { ok: false, reason: "missing-input-response" };
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!res.ok) {
      log.warn("turnstile_http_error", { status: res.status });
      return { ok: false, reason: `http-${res.status}` };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      log.warn("turnstile_failed", { codes: data["error-codes"] });
      return { ok: false, reason: data["error-codes"]?.[0] ?? "unknown" };
    }

    return { ok: true };
  } catch (err) {
    log.error("turnstile_exception", { err: err as Error });
    // Fail open kalau exception jaringan — supaya outage Cloudflare
    // tidak takedown app. Trade-off acceptable: rate limit & validasi
    // lain tetap aktif.
    return { ok: true, reason: "exception-fail-open" };
  }
}
