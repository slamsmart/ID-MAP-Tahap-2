import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

// Mayar.id Sandbox (test): https://api.mayar.club/hl/v1
// Mayar.id Production:      https://api.mayar.id/hl/v1
const MAYAR_BASE = process.env.MAYAR_SANDBOX === "false"
  ? "https://api.mayar.id/hl/v1"
  : "https://api.mayar.club/hl/v1";

const MAYAR_API_KEY = process.env.MAYAR_API_KEY ?? "";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
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

    // Rp 5.000 per tCO2e (perkiraan konversi donasi → karbon)
    const co2Equivalent = +(amount / 5000).toFixed(4);

    // 1. Buat dynamic QRIS via mayar.id
    let qrImageUrl: string | null = null;
    let mayarPaymentId: string | null = null;

    if (MAYAR_API_KEY) {
      const mayarRes = await fetch(`${MAYAR_BASE}/qrcode/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MAYAR_API_KEY}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (mayarRes.ok) {
        const mayarData = await mayarRes.json() as {
          statusCode: number;
          messages: string;
          data?: { url: string; amount: number; id?: string };
        };

        if (mayarData.statusCode === 200 && mayarData.data?.url) {
          qrImageUrl = mayarData.data.url;
          mayarPaymentId = mayarData.data?.id ?? `mayar_${Date.now()}`;
        }
      }
    }

    // Fallback dummy QR jika API key belum diset atau sandbox tidak merespons
    if (!qrImageUrl) {
      // Generate QRIS dummy menggunakan data statis (mode demo)
      qrImageUrl = null; // akan di-handle di frontend dengan qrcode.react
      mayarPaymentId = `dummy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // 2. Simpan donasi pending ke Convex
    const contributionId = await convex.mutation(api.contributions.createPending, {
      projectId: projectId as Id<"projects">,
      userId: userId as Id<"users"> | undefined,
      amount,
      co2Equivalent,
      paymentId: mayarPaymentId ?? undefined,
    });

    return NextResponse.json({
      success: true,
      contributionId,
      paymentId: mayarPaymentId,
      qrImageUrl,
      amount,
      co2Equivalent,
      isSandbox: MAYAR_BASE.includes("mayar.club"),
      isDummy: !MAYAR_API_KEY,
    });
  } catch (error: any) {
    console.error("Create QRIS error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Gagal membuat QRIS" },
      { status: 500 }
    );
  }
}
