// Mayar.id helper
// Docs: https://docs.mayar.id/
// All requests use Bearer auth with the API key from env.

import crypto from "node:crypto";

export const MAYAR_BASE =
  process.env.MAYAR_SANDBOX === "true"
    ? "https://api.mayar.club/hl/v1"
    : "https://api.mayar.id/hl/v1";

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

// Dynamic QRIS
// Returns a QR image URL the user can scan. No auto-redirect.
// NOTE: Mayar's dynamic QRIS endpoint only accepts `{ amount }`.
// The transaction id is derived from the QR image URL (UUID filename).
// We do NOT send extraData because the endpoint does not echo it back,
// so it would not help with webhook correlation.
export type QrisResponse = { url: string; amount: number; id?: string };

export function createQris(amount: number) {
  return call<QrisResponse>("/qrcode/create", { amount });
}

export type PaymentDetailResponse = {
  id?: string;
  transactionId?: string;
  status?: boolean | string;
  amount?: number;
  productId?: string;
  productType?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
};

export function getPayment(paymentId: string) {
  return call<PaymentDetailResponse>(`/payment/get?id=${encodeURIComponent(paymentId)}`);
}

// Invoice (recommended for full checkout flow)
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

// Webhook management
export function registerWebhook(urlHook: string) {
  return call("/webhook/register", { urlHook });
}

export function testWebhook(urlHook: string) {
  return call("/webhook/test", { urlHook });
}

// Webhook signature verification
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
  const normalizedExpected = expected.trim();

  // 1. No token configured -> fail closed (assume unsafe)
  if (!normalizedExpected) {
    return { ok: false, reason: "MAYAR_WEBHOOK_TOKEN not configured" };
  }

  // 2. Token-based auth. Some Mayar deliveries use `Authorization: Bearer …`,
  // others send the raw token or dedicated webhook-token style headers.
  const authCandidates = [
    headers.get("authorization"),
    headers.get("x-webhook-token"),
    headers.get("webhook-token"),
    headers.get("x-callback-token"),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());

  for (const candidate of authCandidates) {
    const token = candidate.toLowerCase().startsWith("bearer ")
      ? candidate.slice("Bearer ".length).trim()
      : candidate;

    if (timingSafeEq(token, normalizedExpected)) return { ok: true };
  }

  // 3. HMAC-SHA256 signature (some Mayar variants)
  const sig =
    headers.get("x-mayar-signature") ??
    headers.get("x-signature") ??
    "";
  if (sig) {
    const computed = crypto
      .createHmac("sha256", normalizedExpected)
      .update(rawBody)
      .digest("hex");
    const normalizedSig = sig.trim();
    if (timingSafeEq(normalizedSig, computed)) return { ok: true };
    return { ok: false, reason: "signature mismatch" };
  }

  if (authCandidates.length > 0) {
    return { ok: false, reason: "signature mismatch" };
  }

  // 4. Fail closed: webhook TANPA auth header/signature tidak boleh diterima.
  //    Jika integrasi provider membutuhkan mode lain, verifikasi harus
  //    dilakukan eksplisit di route handler via server-to-server check.
  return { ok: false, reason: "missing webhook authentication" };
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Webhook payload types
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




