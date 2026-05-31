import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { getServerSession } from "@/lib/serverSession";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.payment.simulate");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Endpoint KHUSUS DEMO/SANDBOX — simulasikan pembayaran berhasil tanpa
// scan QRIS sungguhan. Disable di production via MAYAR_SANDBOX, dan
// extra guard saat sandbox: hanya logged-in user atau admin token yang
// bisa trigger. Tanpa ini, siapa pun yang tahu contributionId bisa
// confirm payment → fundingRaised inflated → cert palsu.
function timingSafeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: NextRequest) {
  if (process.env.MAYAR_SANDBOX !== "true") {
    return NextResponse.json(
      { error: "Simulate endpoint hanya aktif di mode sandbox/demo" },
      { status: 403 }
    );
  }

  // Auth: butuh logged-in user ATAU admin token. Admin token dipakai
  // untuk integration test / e2e harness.
  const adminToken = process.env.ADMIN_API_TOKEN ?? "";
  const provided = request.headers.get("x-admin-token") ?? "";
  const adminOk = adminToken.length >= 16 && timingSafeCompare(provided, adminToken);
  const session = adminOk ? null : getServerSession();

  if (!adminOk && !session) {
    log.warn("simulate_unauthenticated", {
      ip: request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown",
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Rate limit per-IP supaya satu sesi tidak bisa increment tanpa batas.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await rateLimitAsync({ bucket: "simulate:ip", key: ip, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak simulasi. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  try {
    const { contributionId } = await request.json() as { contributionId?: string };

    if (!contributionId || typeof contributionId !== "string") {
      return NextResponse.json({ error: "contributionId diperlukan" }, { status: 400 });
    }

    await convex.mutation(api.contributions.confirmPayment, {
      contributionId: contributionId as Id<"contributions">,
    });

    log.info("simulate_ok", {
      contributionId,
      actor: adminOk ? "admin-token" : session?.uid,
    });
    return NextResponse.json({ success: true, message: "Pembayaran berhasil disimulasikan" });
  } catch (error: any) {
    log.error("simulate_exception", { err: error as Error });
    return NextResponse.json({ error: error?.message ?? "Gagal" }, { status: 500 });
  }
}
