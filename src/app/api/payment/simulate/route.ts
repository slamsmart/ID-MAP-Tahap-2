import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Endpoint KHUSUS DEMO/SANDBOX — simulasikan pembayaran berhasil tanpa
// scan QRIS sungguhan. Aktif HANYA saat MAYAR_SANDBOX === "true" (single
// source of truth dengan UI mode demo). Saat production (MAYAR_SANDBOX
// kosong / "false"), endpoint ini ditolak dengan 403 — ini mencegah
// siapapun increment funding tanpa bayar real.
//
// Panggil dengan: POST /api/payment/simulate { contributionId }
export async function POST(request: NextRequest) {
  if (process.env.MAYAR_SANDBOX !== "true") {
    return NextResponse.json(
      { error: "Simulate endpoint hanya aktif di mode sandbox/demo" },
      { status: 403 }
    );
  }

  try {
    const { contributionId } = await request.json() as { contributionId: string };

    if (!contributionId) {
      return NextResponse.json({ error: "contributionId diperlukan" }, { status: 400 });
    }

    await convex.mutation(api.contributions.confirmPayment, {
      contributionId: contributionId as Id<"contributions">,
    });

    return NextResponse.json({ success: true, message: "Pembayaran berhasil disimulasikan" });
  } catch (error: any) {
    console.error("Simulate payment error:", error);
    return NextResponse.json({ error: error?.message ?? "Gagal" }, { status: 500 });
  }
}
