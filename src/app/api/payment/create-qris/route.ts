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

export async function POST(request: NextRequest) {
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

    const co2Equivalent = +(amount / 5000).toFixed(4);

    if (!isMayarLive) {
      log.error("create_qris_live_key_missing", { amount, projectId, mayarBase: MAYAR_BASE });
      return NextResponse.json(
        { error: "Payment live belum aktif. MAYAR_API_KEY tidak terbaca di production." },
        { status: 503 }
      );
    }

    let qrImageUrl: string | null = null;
    let mayarPaymentId: string | null = null;

    try {
      const res = await createQris(amount);
      qrImageUrl = res.data?.url ?? null;
      mayarPaymentId = res.data?.id ?? null;

      log.info("qris_provider_response", {
        amount,
        hasQrImageUrl: Boolean(qrImageUrl),
        hasPaymentId: Boolean(mayarPaymentId),
        mayarBase: MAYAR_BASE,
      });
    } catch (err) {
      log.error("createQris_failed_live", {
        err: err as Error,
        amount,
        mayarBase: MAYAR_BASE,
      });
      return NextResponse.json(
        { error: "Gagal membuat QRIS live dari Mayar." },
        { status: 400 }
      );
    }

    if (!qrImageUrl) {
      log.error("create_qris_missing_qr_url", { amount, hasPaymentId: Boolean(mayarPaymentId) });
      return NextResponse.json(
        { error: "Mayar tidak mengembalikan QR image URL." },
        { status: 400 }
      );
    }

    // Mayar dynamic QRIS sometimes omits `id`; extract from URL path or generate fallback.
    if (!mayarPaymentId) {
      const urlId = qrImageUrl.match(/\/([a-zA-Z0-9_-]{8,})\.[a-z]+(?:[?#]|$)/)?.[1];
      mayarPaymentId = urlId ?? `qris_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      log.warn("create_qris_id_fallback", { amount, paymentId: mayarPaymentId, qrImageUrl });
    }

    const contributionId = await convex.mutation(api.contributions.createPending, {
      projectId: projectId as Id<"projects">,
      userId: userId as Id<"users"> | undefined,
      amount,
      co2Equivalent,
      paymentId: mayarPaymentId,
    });

    log.info("qris_created", {
      paymentId: mayarPaymentId ?? null,
      contributionId,
      amount,      hasQrImageUrl: true,
    });

    return NextResponse.json({
      success: true,
      contributionId,
      paymentId: mayarPaymentId,
      qrImageUrl,
      amount,
      co2Equivalent,
      isSandbox: MAYAR_BASE.includes("mayar.club"),    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat QRIS";
    log.error("create_qris_exception", { err: error as Error });
    return NextResponse.json(
      {
        error: msg,
        debug: true,
        convexUrl: CONVEX_URL,
        isMayarLive,
      },
      { status: 500 }
    );
  }
}

