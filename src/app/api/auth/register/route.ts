import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/sessionToken";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.auth.register");
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const ALLOWED_ROLES = new Set(["sahabat", "mitra", "verifikator", "admin", "corporate"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!email || !password || !name || !ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: "Field tidak lengkap." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const phone = typeof body.phone === "string" ? body.phone : undefined;
    const organization = typeof body.organization === "string" ? body.organization : undefined;
    const address = typeof body.address === "string" ? body.address : undefined;

    let userId: string;
    try {
      userId = await convex.mutation(api.users.create, {
        email,
        password,
        name,
        role: role as "sahabat" | "mitra" | "verifikator" | "admin" | "corporate",
        ...(phone ? { phone } : {}),
        ...(organization ? { organization } : {}),
        ...(address ? { address } : {}),
      });
    } catch (err: any) {
      const msg = typeof err?.data === "string" ? err.data : err?.data?.message ?? err?.message ?? "";
      if (msg.includes("DUPLICATE_EMAIL") || msg.includes("sudah terdaftar")) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
      }
      log.error("register_exception", { err: err as Error });
      return NextResponse.json({ error: "Gagal mendaftar." }, { status: 500 });
    }

    const { token } = createSessionToken({
      uid: userId,
      email,
      name,
      role: role as any,
    });

    const res = NextResponse.json({
      user: { _id: userId, email, name, role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    log.info("register_ok", { email, role });
    return res;
  } catch (err) {
    log.error("register_handler_exception", { err: err as Error });
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
