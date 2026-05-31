import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { createInvoice, isMayarLive, MAYAR_BASE } from "../../../../lib/mayar";
import { rateLimit } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.payment.create-invoice");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Invoice-based checkout (richer UX than dynamic QRIS).
// Customer is redirected to a Mayar-hosted checkout page that supports QRIS,
// VA, e-wallet, and credit card. Use this for higher-value donations or
// corporate (B2B) payments where you want an invoice document attached.
//
// SECURITY: public endpoint (B2B donor input email/mobile). Rate limit
// per-IP melindungi Mayar quota & Convex insert spam.
export async function POST(request: NextRequest) {
  // Rate limit per IP: 5 invoice / jam. Lebih ketat dari QRIS karena
  // invoice membutuhkan personal data donor.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit({
    bucket: "invoice:ip",
    key: ip,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    log.warn("invoice_rate_limited", { ip, retryAfterMs: rl.retryAfterMs });
    return NextResponse.json(
      { error: "Terlalu banyak permintaan invoice. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = (await request.json()) as {
      amount: number;
      projectId: string;
      userId?: string;
      donor: { name: string; email: string; mobile: string };
      description?: string;
      redirectUrl?: string;
    };

    const { amount, projectId, userId, donor } = body;
    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: "Jumlah minimal adalah Rp 1.000" },
        { status: 400 }
      );
    }
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId diperlukan" },
        { status: 400 }
      );
    }
    if (!donor?.name || !donor?.email || !donor?.mobile) {
      return NextResponse.json(
        { error: "Data donor (nama, email, mobile) wajib diisi" },
        { status: 400 }
      );
    }
    if (!isMayarLive) {
      return NextResponse.json(
        {
          error: "MAYAR_API_KEY belum dikonfigurasi. Gunakan /create-qris untuk mode demo.",
        },
        { status: 503 }
      );
    }

    const co2Equivalent = +(amount / 5000).toFixed(4);

    // 1. Create Convex contribution first so we have a stable id to echo
    //    in extraData, which Mayar returns back via webhook.
    const contributionId = await convex.mutation(
      api.contributions.createPending,
      {
        projectId: projectId as Id<"projects">,
        userId: userId as Id<"users"> | undefined,
        amount,
        co2Equivalent,
        paymentId: undefined,
      }
    );

    // Invoice expires in 24h (UTC ISO).
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const description =
      body.description ?? `Donasi ID-MAP untuk proyek mangrove`;
    const redirectUrl =
      body.redirectUrl ??
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://id-map-national.vercel.app"}/donasi/sukses`;

    const inv = await createInvoice({
      name: donor.name,
      email: donor.email,
      mobile: donor.mobile,
      redirectUrl,
      description,
      expiredAt,
      items: [
        {
          quantity: 1,
          rate: amount,
          description,
        },
      ],
      extraData: {
        contributionId: String(contributionId),
        projectId,
        co2Equivalent: String(co2Equivalent),
      },
    });

    if (!inv.data) {
      return NextResponse.json(
        { error: "Mayar tidak mengembalikan invoice" },
        { status: 502 }
      );
    }

    // 2. Update contribution with the Mayar transactionId so webhook can
    //    look it up via by_paymentId.
    await convex.mutation(api.contributions.attachPaymentId, {
      contributionId: contributionId as Id<"contributions">,
      paymentId: inv.data.transactionId,
    });

    return NextResponse.json({
      success: true,
      contributionId,
      paymentId: inv.data.transactionId,
      invoiceId: inv.data.id,
      checkoutUrl: inv.data.link,
      expiredAt: inv.data.expiredAt,
      amount,
      co2Equivalent,
      isSandbox: MAYAR_BASE.includes("mayar.club"),
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal membuat invoice";
    console.error("Create invoice error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
