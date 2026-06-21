import { NextRequest, NextResponse } from "next/server";

// /referral/<CODE> -> /daftar?peran=sahabat&ref=<CODE>
// Pretty share link untuk ajak teman. Kode disanitasi (A-Z0-9, max 12).
export function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = (params.code ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);

  const url = new URL("/daftar", req.url);
  url.searchParams.set("peran", "sahabat");
  if (code) url.searchParams.set("ref", code);

  return NextResponse.redirect(url, 308);
}
