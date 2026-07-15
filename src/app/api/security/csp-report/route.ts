import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const report = await req.json().catch(() => null);
  if (report) {
    console.warn("[csp-report]", JSON.stringify(report).slice(0, 2000));
  }
  return new NextResponse(null, { status: 204 });
}
