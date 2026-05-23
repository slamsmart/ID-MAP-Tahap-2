import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Endpoint KHUSUS DEV/DEMO — simulasikan pembayaran berhasil tanpa perlu scan QRIS sungguhan
// Panggil dengan: POST /api/payment/simulate { contributionId }
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SIMULATE !== "true") {
    return NextResponse.json({ error: "Tidak tersedia di production" }, { status: 403 });
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
