import { describe, it, expect, beforeAll } from "vitest";

const TEST_WEBHOOK_TOKEN = "test-mayar-webhook-token-12345";

beforeAll(() => {
  process.env.MAYAR_WEBHOOK_TOKEN = TEST_WEBHOOK_TOKEN;
});

// Import setelah set env
import { verifyWebhook } from "../../src/lib/mayar";
import crypto from "node:crypto";

function makeHeaders(headers: Record<string, string>): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return h;
}

describe("verifyWebhook", () => {
  const rawBody = JSON.stringify({ event: "payment.received", data: { id: "inv_123", status: "paid" } });

  it("Bearer token valid -> ok:true", () => {
    const headers = makeHeaders({ Authorization: `Bearer ${TEST_WEBHOOK_TOKEN}` });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(true);
  });

  it("Bearer token salah -> ok:false", () => {
    const headers = makeHeaders({ Authorization: "Bearer wrong-token" });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(false);
  });

  it("HMAC signature valid (x-mayar-signature) -> ok:true", () => {
    const sig = crypto.createHmac("sha256", TEST_WEBHOOK_TOKEN).update(rawBody).digest("hex");
    const headers = makeHeaders({ "x-mayar-signature": sig });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(true);
  });

  it("HMAC signature valid (x-signature) -> ok:true", () => {
    const sig = crypto.createHmac("sha256", TEST_WEBHOOK_TOKEN).update(rawBody).digest("hex");
    const headers = makeHeaders({ "x-signature": sig });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(true);
  });

  it("HMAC signature salah -> ok:false", () => {
    const headers = makeHeaders({ "x-mayar-signature": "invalid-signature-hex" });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(false);
  });

  it("tidak ada token env -> ok:false (fail closed)", () => {
    const orig = process.env.MAYAR_WEBHOOK_TOKEN;
    delete process.env.MAYAR_WEBHOOK_TOKEN;
    const headers = makeHeaders({ Authorization: "Bearer anything" });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(false);
    if (orig) process.env.MAYAR_WEBHOOK_TOKEN = orig;
  });

  it("tidak ada header auth -> ok:false (fail closed)", () => {
    const headers = makeHeaders({});
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("missing webhook authentication");
  });

  it("timing-safe: panjang berbeda -> false", () => {
    const headers = makeHeaders({
      Authorization: `Bearer ${TEST_WEBHOOK_TOKEN.substring(0, 10)}`,
    });
    const result = verifyWebhook(rawBody, headers);
    expect(result.ok).toBe(false);
  });
});
