import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Lightweight status polling endpoint.
// Public (no auth) so the donation page can poll while waiting for the webhook.
// Returns minimal info — no PII, no amounts.
export async function GET(request: NextRequest) {
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
