import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { createQris, isMayarLive, MAYAR_BASE } from "../../../../lib/mayar";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.payment.create-qris");
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(CONVEX_URL);

// Create a dynamic QRIS for community donation (B2C).
//
// Flow:
//   1. Client POSTs { amount, projectId, userId? }.
//   2. We hit Mayar /qrcode/create to mint a QR image URL.
//   3. We persist a "pending" contribution in Convex tagged with the QR id.
//   4. When user pays, Mayar POSTs the webhook → we flip status to "paid".
//
// If MAYAR_API_KEY is unset, we return a dummy paymentId so the UI can
// still render a fallback QR (qrcode.react). Useful for local dev.
//
// SECURITY: endpoint sengaja public (juri/visitor bisa coba donasi tanpa
// login). Rate limit per-IP melindungi Mayar quota & Convex insert spam.
export async function POST(request: NextRequest) {
  // Rate limit per IP: 10 QRIS / jam. Cukup untuk user normal,
  // memblokir bot/looper. Pakai Redis kalau env ada → multi-instance correct.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await rateLimitAsync({
    bucket: "qris:ip",
    key: ip,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    log.warn("qris_rate_limited", { ip, retryAfterMs: rl.retryAfterMs });
    return NextResponse.json(
      { error: "Terlalu banyak permintaan QRIS. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = (await request.json()) as {
      amount: number;
      projectId: string;
      userId?: string;
    };

    const { amount, projectId, userId } = body;

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: "Jumlah minimal donasi adalah Rp 1.000" },
        { status: 400 }
      );
    }
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId diperlukan" },
        { status: 400 }
      );
    }

    // Conversion: Rp 5.000 ≈ 1 tCO2e support (UI only, not regulatory).
    const co2Equivalent = +(amount / 5000).toFixed(4);

    let qrImageUrl: string | null = null;
    let mayarPaymentId: string | null = null;

    if (isMayarLive) {
      try {
        const res = await createQris(amount);
        qrImageUrl = res.data?.url ?? null;
        mayarPaymentId = res.data?.id ?? `mayar_${Date.now()}`;
      } catch (err) {
        log.warn("createQris_failed_fallback", { err: err as Error, amount });
      }
    }

    if (!mayarPaymentId) {
      mayarPaymentId = `dummy_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
    }

    const contributionId = await convex.mutation(
      api.contributions.createPending,
      {
        projectId: projectId as Id<"projects">,
        userId: userId as Id<"users"> | undefined,
        amount,
        co2Equivalent,
        paymentId: mayarPaymentId,
      }
    );

    log.info("qris_created", {
      paymentId: mayarPaymentId,
      contributionId,
      amount,
      isDummy: !isMayarLive || !qrImageUrl,
    });
    return NextResponse.json({
      success: true,
      contributionId,
      paymentId: mayarPaymentId,
      qrImageUrl,
      amount,
      co2Equivalent,
      isSandbox: MAYAR_BASE.includes("mayar.club"),
      isDummy: !isMayarLive || !qrImageUrl,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat QRIS";
    log.error("create_qris_exception", { err: error as Error });
    return NextResponse.json({
      error: msg,
      debug: true,
      convexUrl: CONVEX_URL,
      isMayarLive,
      mayarBase: MAYAR_BASE,
    }, { status: 500 });
  }
}
