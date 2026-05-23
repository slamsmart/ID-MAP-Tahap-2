import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan." }, { status: 400 });
    }

    // Generate OTP via Convex
    const code = await convex.mutation(api.otpCodes.createOtp, { email });

    // Send email via Resend
    const from = process.env.RESEND_FROM ?? "ID-MAP <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: `${code} — Kode Verifikasi ID-MAP`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:28px;font-weight:900;color:#0f3d2e;letter-spacing:-1px">ID-MAP</span>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">Verifikasi Email Anda</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
            Halo ${name ?? ""}! Gunakan kode berikut untuk menyelesaikan pendaftaran:
          </p>
          <div style="background:#fff;border:2px solid #d1fae5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#065f46">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
            Kode berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini ke siapapun.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Gagal mengirim email." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status: 500 });
  }
}
