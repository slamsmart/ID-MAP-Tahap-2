import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/sessionToken";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

    const { email, credentialId, counter } = body;
    if (!credentialId) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolvedUser: any = null;
    let resolvedCounter = 0;

    if (email) {
      // Email-based lookup (user typed email first)
      resolvedUser = await convex.query(api.users.getByEmail, {
        email: email.toLowerCase().trim(),
      });
      if (!resolvedUser) {
        return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 401 });
      }
      const creds: Array<{ credentialId: string; counter: number }> =
        resolvedUser.webauthnCredentials ?? [];
      const matched = creds.find((c) => c.credentialId === credentialId);
      if (!matched) {
        return NextResponse.json(
          { error: "Biometrik tidak dikenali untuk akun ini." },
          { status: 401 }
        );
      }
      resolvedCounter = matched.counter;
    } else {
      // Discoverable-credential lookup (no email, browser presented passkey)
      const found = await convex.query(api.webauthn.getUserByCredentialId, { credentialId });
      if (!found) {
        return NextResponse.json({ error: "Biometrik tidak dikenali." }, { status: 401 });
      }
      resolvedUser = found;
      resolvedCounter = found.counter;
    }

    // Update counter to prevent replay attacks
    if (typeof counter === "number" && counter >= resolvedCounter) {
      await convex.mutation(api.webauthn.updateCounter, {
        userId: resolvedUser._id,
        credentialId,
        counter,
      });
    }

    const { token } = createSessionToken({
      uid: resolvedUser._id,
      email: resolvedUser.email,
      name: resolvedUser.name,
      role: resolvedUser.role,
    });

    const res = NextResponse.json({
      user: { _id: resolvedUser._id, email: resolvedUser.email, name: resolvedUser.name, role: resolvedUser.role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
