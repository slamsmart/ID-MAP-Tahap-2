import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import type { FunctionArgs } from "convex/server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { requireRole } from "@/lib/serverSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Operation =
  | "about.update"
  | "faq.update"
  | "footer.update"
  | "landingHero.update"
  | "roles.update"
  | "service.update"
  | "service.generateUploadUrl";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
  const guard = requireRole(["admin", "verifikator"]);
  if (guard.error) return guard.error;

  try {
    const body = (await req.json().catch(() => null)) as {
      operation?: Operation;
      payload?: unknown;
    } | null;

    if (!body?.operation) {
      return NextResponse.json({ error: "Operasi admin tidak valid." }, { status: 400 });
    }

    const payload = isRecord(body.payload) ? body.payload : {};
    const convex = getConvexClient();
    const adminSecret = getAdminSecret();
    const actorId = guard.session.uid as Id<"users">;
    const args = { ...payload, actorId, adminSecret };

    switch (body.operation) {
      case "about.update":
        await convex.mutation(
          api.aboutContent.update,
          args as FunctionArgs<typeof api.aboutContent.update>
        );
        return NextResponse.json({ result: null });
      case "faq.update":
        await convex.mutation(
          api.faqContent.update,
          args as FunctionArgs<typeof api.faqContent.update>
        );
        return NextResponse.json({ result: null });
      case "footer.update":
        await convex.mutation(
          api.footerContent.update,
          args as FunctionArgs<typeof api.footerContent.update>
        );
        return NextResponse.json({ result: null });
      case "landingHero.update":
        await convex.mutation(
          api.landingHero.update,
          args as FunctionArgs<typeof api.landingHero.update>
        );
        return NextResponse.json({ result: null });
      case "roles.update":
        await convex.mutation(
          api.rolesSection.update,
          args as FunctionArgs<typeof api.rolesSection.update>
        );
        return NextResponse.json({ result: null });
      case "service.update":
        await convex.mutation(
          api.serviceContent.update,
          args as FunctionArgs<typeof api.serviceContent.update>
        );
        return NextResponse.json({ result: null });
      case "service.generateUploadUrl": {
        const result = await convex.mutation(api.serviceContent.generateUploadUrl, {
          actorId,
          adminSecret,
        });
        return NextResponse.json({ result });
      }
      default:
        return NextResponse.json({ error: "Operasi admin tidak valid." }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("[admin/content]", err);
    const message =
      err instanceof Error &&
      (err.message === "convex_url_missing" || err.message === "admin_secret_missing")
        ? "Konfigurasi admin server belum lengkap."
        : "Gagal menjalankan operasi admin.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
