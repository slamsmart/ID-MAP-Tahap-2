import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  verifyWebhook,
  type MayarWebhookPayload,
} from "../../../../lib/mayar";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.payment.webhook");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Mayar.id POSTs here when payment events occur.
// Spec: https://docs.mayar.id/integration/webhook
//
// Security:
// - Mayar sends the configured Webhook Token as `Authorization: Bearer …`
//   (MAYAR_WEBHOOK_TOKEN env). We verify it on every call.
// - Some setups also sign the body via `x-mayar-signature` (HMAC-SHA256 of
//   body using the same token as key). We accept that too.
//
// Mayar expects a 2xx within ~5s; otherwise it retries. Keep work minimal.
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const rawBody = await request.text();

  // DEBUG: log ALL incoming headers to find what Mayar actually sends
  const allHeaders: Record<string, string> = {};
  request.headers.forEach((v, k) => { allHeaders[k] = k.toLowerCase().includes("token") || k.toLowerCase().includes("auth") || k.toLowerCase().includes("sign") ? v.slice(0, 20) + "…" : v; });
  const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN ?? "";
  log.warn("webhook_debug_headers", {
    headers: allHeaders,
    expectedLen: expectedToken.length,
    expectedPrefix: expectedToken.slice(0, 8),
  });

  const verdict = verifyWebhook(rawBody, request.headers);
  if (!verdict.ok) {
    log.warn("webhook_rejected", { reason: verdict.reason, bodyLen: rawBody.length });
    return NextResponse.json(
      { received: false, error: verdict.reason },
      { status: 401 }
    );
  }

  let payload: MayarWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MayarWebhookPayload;
  } catch {
    log.warn("webhook_invalid_json", { bodyLen: rawBody.length });
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = payload.event;
  const data = payload.data;
  const contributionId = data?.extraData?.contributionId;
  const paymentIds = [
    data?.transactionId,
    data?.extraData?.transactionId,
    data?.extraData?.paymentId,
    data?.id,
  ].filter((id): id is string => typeof id === "string" && id.trim().length > 0);
  const paymentId = paymentIds[0] ?? "";

  if (!contributionId && !paymentId) {
    log.warn("webhook_missing_payment_reference", { event });
    return NextResponse.json({ error: "paymentId missing" }, { status: 400 });
  }

  try {
    if (event === "payment.received" && isPaid(data?.status)) {
      const amount = typeof data?.amount === "number" ? data.amount : undefined;
      if (contributionId) {
        const alreadyPaid = await convex.query(api.contributions.getStatus, {
          contributionId: contributionId as Id<"contributions">,
        });
        if (alreadyPaid?.paymentStatus === "paid") {
          log.info("webhook_idempotent_skip", {
            event,
        contributionId,
        paymentId,
      });
          return NextResponse.json({ received: true, event, skipped: true });
        }
        await convex.mutation(api.contributions.confirmPaymentFromWebhook, {
          contributionId: contributionId as Id<"contributions">,
          amount,
      paymentId,
    });
      } else {
        await convex.mutation(api.contributions.confirmByPaymentIds, {
          paymentIds,
          amount,
        });
      }
      log.info("payment_confirmed", {
        event,
        contributionId,
        paymentId,
        paymentIds,
        status: data?.status,
        durationMs: Date.now() - startedAt,
      });
    } else {
      log.info("webhook_ack", { event, paymentId, status: data?.status });
    }
    return NextResponse.json({ received: true, event });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "webhook failed";
    log.error("webhook_handler_exception", {
      event,
      paymentId,
      err: error as Error,
    });
    // 5xx so Mayar retries.
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function isPaid(status: unknown): boolean {
  if (status === true) return true;
  if (typeof status === "string") {
    return /^paid$/i.test(status.trim());
  }
  return false;
}

// Allow GET for quick reachability check from Mayar dashboard "Test URL".
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "id-map mayar webhook",
  });
}

