import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { requireRole } from "@/lib/serverSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Operation =
  | "seedAll"
  | "resetAndSeed"
  | "seedPokmaswasProjects"
  | "seedDummyCertificates"
  | "seedGamificationDummy"
  | "partnerOrganizations.seedPilot";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("convex_url_missing");
  return new ConvexHttpClient(url);
}

function getAdminSecret() {
  const secret = process.env.CONVEX_ADMIN_MUTATION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("admin_secret_missing");
  }
  return secret;
}

export async function POST(req: Request) {
  const guard = requireRole(["admin"]);
  if (guard.error) return guard.error;

  try {
    const body = (await req.json().catch(() => null)) as { operation?: Operation } | null;
    if (!body?.operation) {
      return NextResponse.json({ error: "Operasi seed tidak valid." }, { status: 400 });
    }

    const convex = getConvexClient();
    const adminSecret = getAdminSecret();
    const args = { adminSecret };
    let result: string;

    switch (body.operation) {
      case "seedAll":
        result = await convex.mutation(api.seed.seedAll, args);
        break;
      case "resetAndSeed":
        result = await convex.mutation(api.seed.resetAndSeed, args);
        break;
      case "seedPokmaswasProjects":
        result = await convex.mutation(api.seed.seedPokmaswasProjects, args);
        break;
      case "seedDummyCertificates":
        result = await convex.mutation(api.seed.seedDummyCertificates, args);
        break;
      case "seedGamificationDummy":
        result = await convex.mutation(api.seed.seedGamificationDummy, args);
        break;
      case "partnerOrganizations.seedPilot":
        result = await convex.mutation(api.partnerOrganizations.seedPilot, args);
        break;
      default:
        return NextResponse.json({ error: "Operasi seed tidak valid." }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error("[admin/seed]", err);
    const message =
      err instanceof Error &&
      (err.message === "convex_url_missing" || err.message === "admin_secret_missing")
        ? "Konfigurasi admin server belum lengkap."
        : "Gagal menjalankan seed admin.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
