import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { rateLimit } from "@/lib/rateLimit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Lightweight status polling endpoint.
// Public (no auth) so the donation page can poll while waiting for the webhook.
// Returns minimal info — no PII, no amounts.
//
// Rate limit per-IP melindungi dari enumeration contributionId. Polling
// normal hanya butuh ~1/3 detik selama 1-2 menit (~120 req max per donasi).
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit({
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
    const c = await convex.query(api.contributions.getStatus, {
      contributionId: id as Id<"contributions">,
    });
    if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(
      { paymentStatus: c.paymentStatus ?? "pending" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
