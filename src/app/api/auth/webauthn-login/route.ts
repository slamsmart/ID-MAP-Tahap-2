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
    if (!email || !credentialId) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    const user = await convex.query(api.users.getByEmail, {
      email: email.toLowerCase().trim(),
    });
    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creds: Array<{ credentialId: string; counter: number }> =
      (user as any).webauthnCredentials ?? [];
    const matched = creds.find((c) => c.credentialId === credentialId);
    if (!matched) {
      return NextResponse.json(
        { error: "Biometrik tidak dikenali untuk akun ini." },
        { status: 401 }
      );
    }

    // Update counter to prevent replay attacks
    if (typeof counter === "number" && counter >= matched.counter) {
      await convex.mutation(api.webauthn.updateCounter, {
        userId: user._id,
        credentialId,
        counter,
      });
    }

    const { token } = createSessionToken({
      uid: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      user: { _id: user._id, email: user.email, name: user.name, role: user.role },
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
