import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";
import { getPayment, isMayarLive } from "@/lib/mayar";

const log = createLogger("api.payment.status");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function isPaidLike(status: unknown) {
  if (typeof status === "boolean") return status;
  if (typeof status !== "string") return false;
  const normalized = status.trim().toLowerCase();
  return normalized === "paid" || normalized === "success" || normalized === "succeeded";
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await rateLimitAsync({
    bucket: "payment-status:ip",
    key: ip,
    limit: 240,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak polling. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const id = request.nextUrl.searchParams.get("contributionId");
  if (!id) {
    return NextResponse.json({ error: "contributionId required" }, { status: 400 });
  }

  try {
    const c = await convex.query(api.contributions.getStatusDetail, {
      contributionId: id as Id<"contributions">,
    });
    if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (c.paymentStatus === "paid") {
      return NextResponse.json(
        { paymentStatus: "paid", source: "db" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const paymentId = c.paymentId?.trim();
    const canCheckProvider = isMayarLive && c.method === "QRIS" && Boolean(paymentId) && !paymentId?.startsWith("dummy_");

    if (canCheckProvider && paymentId) {
      try {
        const payment = await getPayment(paymentId);
        const providerStatus = payment.data?.status;
        const providerAmount = payment.data?.amount;
        const paid = isPaidLike(providerStatus);

        log.info("payment_status_provider_check", {
          contributionId: id,
          paymentId,
          providerStatus,
          providerAmount: typeof providerAmount === "number" ? providerAmount : null,
          dbStatus: c.paymentStatus ?? "pending",
          paid,
        });

        if (paid) {
          await convex.mutation(api.contributions.confirmPaymentForContribution, {
            contributionId: id as Id<"contributions">,
            paymentId,
            amount: typeof providerAmount === "number" ? providerAmount : c.amount,
          });

          log.info("payment_status_auto_confirmed", {
            contributionId: id,
            paymentId,
            amount: typeof providerAmount === "number" ? providerAmount : c.amount,
          });

          return NextResponse.json(
            { paymentStatus: "paid", source: "provider" },
            { headers: { "Cache-Control": "no-store" } }
          );
        }
      } catch (providerError) {
        log.warn("payment_status_provider_lookup_failed", {
          contributionId: id,
          paymentId,
          error: providerError instanceof Error ? providerError.message : "lookup failed",
        });
      }
    }

    return NextResponse.json(
      { paymentStatus: c.paymentStatus ?? "pending", source: "db" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "lookup failed";
    log.error("payment_status_exception", { error: msg, contributionId: id });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}