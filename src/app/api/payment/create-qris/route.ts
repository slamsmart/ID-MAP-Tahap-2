import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { createQris, isMayarLive, MAYAR_BASE } from "../../../../lib/mayar";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
export async function POST(request: NextRequest) {
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
        // Don't fail the whole request — fall through to dummy mode so the
        // donor can still see something. Surface the error to the client.
        console.warn("[mayar] createQris failed, falling back to dummy:", err);
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
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Create QRIS error:", msg, stack);
    return NextResponse.json({ error: msg, stack, debug: true }, { status: 500 });
  }
}
