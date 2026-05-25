import { NextRequest, NextResponse } from "next/server";
import {
  registerWebhook,
  testWebhook,
  isMayarLive,
  MAYAR_BASE,
} from "../../../../lib/mayar";

// Admin helper to (re)register the webhook URL with Mayar.
// Protected by ADMIN_API_TOKEN so it can't be abused.
//
// Usage:
//   POST /api/payment/register-webhook
//     Header  : x-admin-token: <ADMIN_API_TOKEN>
//     Body    : { "urlHook": "https://your-domain/api/payment/webhook", "test": true }
export async function POST(request: NextRequest) {
  const adminToken = process.env.ADMIN_API_TOKEN ?? "";
  const provided = request.headers.get("x-admin-token") ?? "";
  if (!adminToken || provided !== adminToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isMayarLive) {
    return NextResponse.json(
      { error: "MAYAR_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      urlHook: string;
      test?: boolean;
    };
    if (!body.urlHook) {
      return NextResponse.json({ error: "urlHook required" }, { status: 400 });
    }

    const reg = await registerWebhook(body.urlHook);
    let testResult: unknown = null;
    if (body.test) {
      testResult = await testWebhook(body.urlHook);
    }

    return NextResponse.json({
      success: true,
      base: MAYAR_BASE,
      register: reg,
      test: testResult,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal register webhook";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
