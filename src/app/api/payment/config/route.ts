import { NextResponse } from "next/server";

// Public flag untuk frontend mendeteksi mode sandbox/demo.
// Di-fetch sekali dari /donasi-cepat agar banner persisten muncul
// sebelum user klik "Buat QR" (qrisData.isSandbox baru tersedia after).
export async function GET() {
  return NextResponse.json({
    sandbox: process.env.MAYAR_SANDBOX === "true",
    hasMayarKey: (process.env.MAYAR_API_KEY ?? "").length > 0,
  });
}
