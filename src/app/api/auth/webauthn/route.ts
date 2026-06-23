import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/sessionToken";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/auth/webauthn
 * Saves a WebAuthn credential to the logged-in user's account.
 * Called right after registration OR from the security settings page.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

    const { credentialId, publicKey, counter, deviceName, challenge, visitorId, userId } = body;

    if (!credentialId || !publicKey || challenge === undefined) {
      return NextResponse.json({ error: "Data credential tidak lengkap." }, { status: 400 });
    }

    // Prefer userId from body (passed during registration before session exists),
    // fall back to session cookie for post-login credential additions.
    let targetUserId = userId;
    if (!targetUserId) {
      const token = req.cookies.get(SESSION_COOKIE)?.value;
      const session = verifySessionToken(token);
      if (!session) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
      targetUserId = session.uid;
    }

    await convex.mutation(api.webauthn.registerCredential, {
      userId: targetUserId,
      credentialId,
      publicKey: publicKey ?? "",
      counter: counter ?? 0,
      deviceName: deviceName ?? undefined,
      visitorId: visitorId ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
