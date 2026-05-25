// ─── Mayar.id helper ────────────────────────────────────────────
// Docs: https://docs.mayar.id/
// All requests use Bearer auth with the API key from env.

import crypto from "node:crypto";

export const MAYAR_BASE =
  process.env.MAYAR_SANDBOX === "false"
    ? "https://api.mayar.id/hl/v1"
    : "https://api.mayar.club/hl/v1";

export const MAYAR_API_KEY = process.env.MAYAR_API_KEY ?? "";

/** Whether API key is configured (otherwise app falls back to demo mode). */
export const isMayarLive = MAYAR_API_KEY.length > 0;

type MayarResponse<T> = {
  statusCode: number;
  messages: string;
  data?: T;
};

async function call<T>(
  path: string,
  body?: Record<string, unknown>,
  init?: { method?: "GET" | "POST" }
): Promise<MayarResponse<T>> {
  const method = init?.method ?? (body ? "POST" : "GET");
  const res = await fetch(`${MAYAR_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${MAYAR_API_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json()) as MayarResponse<T>;
  if (!res.ok || json.statusCode >= 400) {
    throw new Error(
      `[Mayar ${method} ${path}] ${json.statusCode ?? res.status}: ${
        json.messages ?? res.statusText
      }`
    );
  }
  return json;
}

// ─── Dynamic QRIS ───────────────────────────────────────────────
// Returns a QR image URL the user can scan. No auto-redirect.
export type QrisResponse = { url: string; amount: number; id?: string };

export function createQris(amount: number) {
  return call<QrisResponse>("/qrcode/create", { amount });
}

// ─── Invoice (recommended for full checkout flow) ───────────────
// Customer is redirected to a Mayar-hosted invoice page that supports
// QRIS, virtual account, e-wallet, and credit card.
export type InvoiceItem = {
  quantity: number;
  rate: number;
  description: string;
};

export type InvoiceCreatePayload = {
  name: string;
  email: string;
  mobile: string;
  redirectUrl: string;
  description: string;
  /** ISO 8601 in UTC, e.g. "2026-04-19T16:43:23.000Z" */
  expiredAt: string;
  items: InvoiceItem[];
  /** Custom data echoed back in the webhook so we can correlate. */
  extraData?: Record<string, string>;
};

export type InvoiceResponse = {
  id: string;
  transactionId: string;
  link: string;
  expiredAt: number;
  extraData?: Record<string, string>;
};

export function createInvoice(payload: InvoiceCreatePayload) {
  return call<InvoiceResponse>("/invoice/create", payload);
}

// ─── Webhook management ─────────────────────────────────────────
export function registerWebhook(urlHook: string) {
  return call("/webhook/register", { urlHook });
}

export function testWebhook(urlHook: string) {
  return call("/webhook/test", { urlHook });
}

// ─── Webhook signature verification ─────────────────────────────
// Per Mayar dashboard: copy the "Webhook Token" / "Secret" and store as
// MAYAR_WEBHOOK_TOKEN. Mayar sends it back as Bearer in the
// Authorization header on every webhook call.
//
// Some providers also send `x-mayar-signature: <hmac-sha256-of-body>`.
// We accept either, defaulting to bearer-token comparison which is what
// Mayar's standard integration uses today.

export function verifyWebhook(
  rawBody: string,
  headers: Headers
): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.MAYAR_WEBHOOK_TOKEN ?? "";

  // 1. No token configured → fail closed (assume unsafe)
  if (!expected) {
    return { ok: false, reason: "MAYAR_WEBHOOK_TOKEN not configured" };
  }

  // 2. Bearer token (Mayar standard)
  const auth = headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (timingSafeEq(token, expected)) return { ok: true };
  }

  // 3. HMAC-SHA256 signature (some Mayar variants)
  const sig =
    headers.get("x-mayar-signature") ??
    headers.get("x-signature") ??
    "";
  if (sig) {
    const computed = crypto
      .createHmac("sha256", expected)
      .update(rawBody)
      .digest("hex");
    if (timingSafeEq(sig, computed)) return { ok: true };
  }

  return { ok: false, reason: "signature mismatch" };
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ─── Webhook payload types ──────────────────────────────────────
// Reference: https://docs.mayar.id/integration/webhook
export type MayarWebhookEvent =
  | "payment.received"
  | "payment.reminder"
  | "shipper.status"
  | "membership.memberUnsubscribed"
  | "membership.memberExpired"
  | "membership.changeTierMemberRegistered"
  | "membership.newMemberRegistered";

export type MayarWebhookPayload = {
  event: MayarWebhookEvent;
  data: {
    id: string;
    status: boolean | string;
    createdAt: string;
    updatedAt: string;
    merchantId: string;
    merchantEmail: string;
    merchantName: string;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
    amount: number;
    isAdminFeeBorneByCustomer?: boolean;
    isChannelFeeBorneByCustomer?: boolean;
    productId?: string;
    productName?: string;
    productType?: string;
    pixelFbp?: string;
    pixelFbc?: string;
    addOn?: unknown[];
    custom_field?: unknown[];
    /** Echoed from invoice extraData. */
    extraData?: Record<string, string>;
    /** Some payloads expose the invoice/transaction id here. */
    transactionId?: string;
  };
};
