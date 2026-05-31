import { NextResponse } from "next/server";

// Public flag — hanya expose `sandbox` (yang sudah jelas dari banner UI).
// JANGAN expose hasMayarKey: itu information disclosure tentang config
// internal yang berguna untuk recon attacker.
export async function GET() {
  return NextResponse.json({
    sandbox: process.env.MAYAR_SANDBOX === "true",
  });
}
