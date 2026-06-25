import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/sessionToken";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const credentialIds = await convex.query(api.webauthn.getCredentialsByEmail, {
      email,
    });
    return NextResponse.json({ credentialIds });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data biometrik." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const credentialId = typeof body.credentialId === "string" ? body.credentialId : "";
    const counter = typeof body.counter === "number" ? body.counter : undefined;
    if (!credentialId) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    let resolvedUser: {
      _id: Id<"users">;
      email: string;
      name: string;
      role: "sahabat" | "mitra" | "mitra_facilitator" | "verifikator" | "admin" | "corporate";
      counter: number;
    } | null = null;
    let resolvedCounter = 0;

    if (email) {
      // Email-based lookup (user typed email first)
      resolvedUser = await convex.query(api.webauthn.getUserByEmailAndCredentialId, {
        email,
        credentialId,
      });
      if (!resolvedUser) {
        return NextResponse.json(
          { error: "Biometrik tidak dikenali untuk akun ini." },
          { status: 401 }
        );
      }
      resolvedCounter = resolvedUser.counter;
    } else {
      // Discoverable-credential lookup (no email, browser presented passkey)
      let found = null;
      try {
        found = await convex.query(api.webauthn.getUserByCredentialId, { credentialId });
      } catch {
        return NextResponse.json(
          {
            error:
              "Login biometrik perlu email sekali di perangkat ini. Masukkan email lalu coba tombol biometrik lagi.",
          },
          { status: 400 }
        );
      }
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
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server biometrik. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
