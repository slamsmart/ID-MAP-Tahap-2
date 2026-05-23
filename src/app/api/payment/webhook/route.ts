import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Terima notifikasi pembayaran dari mayar.id
// Mayar.id akan POST ke endpoint ini saat pembayaran berhasil
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Payload mayar.id webhook (struktur umum):
    // { status: "paid" | "pending", data: { id, amount, ... } }
    const status: string = body?.status ?? body?.payment_status ?? "";
    const paymentId: string =
      body?.data?.id ?? body?.id ?? body?.transaction_id ?? "";

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId missing" }, { status: 400 });
    }

    if (status === "paid" || status === "success" || status === "PAID") {
      await convex.mutation(api.contributions.confirmByPaymentId, { paymentId });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }
}
