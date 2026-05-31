// Authorization helpers untuk Convex mutations.
//
// Konteks: Convex public mutations dapat dipanggil dari browser tanpa
// otentikasi. Sebagai layer defense, mutation sensitif menerima
// `actorId` dan verifikasi role dari DB. Ini bukan full protection
// (penyerang yang tahu actorId admin masih bisa spoof) — proper fix
// jangka panjang adalah server gateway via Next.js API + internalMutation.
//
// TD-14: ganti pola ini dengan Convex Auth atau session-based identity
// supaya `actorId` tidak ke-pass dari client.

import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

type Role = "sahabat" | "mitra" | "mitra_facilitator" | "verifikator" | "admin" | "corporate";

interface QueryCtx {
  db: {
    get: (id: Id<"users">) => Promise<{ _id: Id<"users">; role: Role } | null>;
  };
}

/**
 * Pastikan `actorId` valid dan role-nya ada di whitelist.
 * Throw ConvexError jika tidak. Return user yang sudah diverifikasi.
 */
export async function requireRole<T extends QueryCtx>(
  ctx: T,
  actorId: Id<"users">,
  allowedRoles: Role[]
) {
  const actor = await ctx.db.get(actorId);
  if (!actor) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Sesi tidak valid." });
  }
  if (!allowedRoles.includes(actor.role)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `Aksi ini hanya untuk role: ${allowedRoles.join(", ")}.`,
    });
  }
  return actor;
}

/**
 * Pastikan actor adalah admin.
 */
export async function requireAdmin<T extends QueryCtx>(
  ctx: T,
  actorId: Id<"users">
) {
  return requireRole(ctx, actorId, ["admin"]);
}

/**
 * Pastikan actor adalah pemilik resource ATAU admin.
 */
export async function requireOwnerOrAdmin<T extends QueryCtx>(
  ctx: T,
  actorId: Id<"users">,
  ownerId: Id<"users"> | undefined
) {
  if (actorId === ownerId) return;
  await requireAdmin(ctx, actorId);
}
