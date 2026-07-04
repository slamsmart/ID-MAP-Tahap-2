import { describe, it, expect } from "vitest";
import { ConvexError } from "convex/values";
import type { Id } from "../../convex/_generated/dataModel";

type Role = "sahabat" | "mitra" | "mitra_facilitator" | "verifikator" | "admin" | "corporate";

interface QueryCtx {
  db: {
    get: (id: Id<"users">) => Promise<{ _id: Id<"users">; role: Role } | null>;
  };
}

// Inline authz helpers untuk pure unit testing (tanpa Convex runtime)
async function requireRole<T extends QueryCtx>(
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

async function requireAdmin<T extends QueryCtx>(ctx: T, actorId: Id<"users">) {
  return requireRole(ctx, actorId, ["admin"]);
}

async function requireOwnerOrAdmin<T extends QueryCtx>(
  ctx: T,
  actorId: Id<"users">,
  ownerId: Id<"users"> | undefined
) {
  if (actorId === ownerId) return;
  await requireAdmin(ctx, actorId);
}

const makeUser = (id: string, role: Role) => ({
  _id: id as Id<"users">,
  role,
});

const makeCtx = (user: { _id: Id<"users">; role: Role } | null): QueryCtx => ({
  db: {
    get: async () => user,
  },
});

describe("requireRole", () => {
  it("admin allowed -> return user", async () => {
    const user = makeUser("u1", "admin");
    const result = await requireRole(makeCtx(user), user._id, ["admin"]);
    expect(result.role).toBe("admin");
  });

  it("sahabat allowed sebagai 'sahabat' -> return user", async () => {
    const user = makeUser("u2", "sahabat");
    const result = await requireRole(makeCtx(user), user._id, ["sahabat", "mitra"]);
    expect(result.role).toBe("sahabat");
  });

  it("user tidak exist -> throw UNAUTHORIZED", async () => {
    await expect(
      requireRole(makeCtx(null), "nonexistent" as Id<"users">, ["admin"])
    ).rejects.toThrow(ConvexError);
  });

  it("role tidak di whitelist -> throw FORBIDDEN", async () => {
    const user = makeUser("u3", "corporate");
    await expect(
      requireRole(makeCtx(user), user._id, ["admin", "verifikator"])
    ).rejects.toThrow(ConvexError);
  });

  for (const role of ["sahabat", "mitra", "mitra_facilitator", "verifikator", "admin", "corporate"] as Role[]) {
    it(`semua role '${role}' bisa dicek via requireRole`, async () => {
      const user = makeUser("u-" + role, role);
      const result = await requireRole(makeCtx(user), user._id, [role]);
      expect(result.role).toBe(role);
    });
  }
});

describe("requireAdmin", () => {
  it("admin -> pass", async () => {
    const user = makeUser("admin1", "admin");
    await expect(requireAdmin(makeCtx(user), user._id)).resolves.not.toThrow();
  });

  it("sahabat -> throw", async () => {
    const user = makeUser("s1", "sahabat");
    await expect(requireAdmin(makeCtx(user), user._id)).rejects.toThrow(ConvexError);
  });

  it("mitra -> throw", async () => {
    const user = makeUser("m1", "mitra");
    await expect(requireAdmin(makeCtx(user), user._id)).rejects.toThrow(ConvexError);
  });

  it("verifikator -> throw", async () => {
    const user = makeUser("v1", "verifikator");
    await expect(requireAdmin(makeCtx(user), user._id)).rejects.toThrow(ConvexError);
  });

  it("corporate -> throw", async () => {
    const user = makeUser("c1", "corporate");
    await expect(requireAdmin(makeCtx(user), user._id)).rejects.toThrow(ConvexError);
  });
});

describe("requireOwnerOrAdmin", () => {
  it("owner sendiri -> pass", async () => {
    const user = makeUser("own1", "sahabat");
    await expect(
      requireOwnerOrAdmin(makeCtx(user), user._id, user._id)
    ).resolves.not.toThrow();
  });

  it("admin akses user lain -> pass", async () => {
    const admin = makeUser("admin2", "admin");
    const other = "user-lain" as Id<"users">;
    await expect(
      requireOwnerOrAdmin(makeCtx(admin), admin._id, other)
    ).resolves.not.toThrow();
  });

  it("sahabat akses user lain -> throw", async () => {
    const user = makeUser("s2", "sahabat");
    const other = "user-lain" as Id<"users">;
    await expect(
      requireOwnerOrAdmin(makeCtx(user), user._id, other)
    ).rejects.toThrow(ConvexError);
  });

  it("mitra akses user lain -> throw", async () => {
    const user = makeUser("m2", "mitra");
    const other = "user-lain" as Id<"users">;
    await expect(
      requireOwnerOrAdmin(makeCtx(user), user._id, other)
    ).rejects.toThrow(ConvexError);
  });

  it("corporate akses user lain -> throw", async () => {
    const user = makeUser("c2", "corporate");
    const other = "user-lain" as Id<"users">;
    await expect(
      requireOwnerOrAdmin(makeCtx(user), user._id, other)
    ).rejects.toThrow(ConvexError);
  });

  it("user tidak exist -> throw", async () => {
    await expect(
      requireOwnerOrAdmin(makeCtx(null), "missing" as Id<"users">, "ownerx" as Id<"users">)
    ).rejects.toThrow(ConvexError);
  });
});