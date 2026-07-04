import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type AuditSource = "api" | "convex" | "webhook" | "system";

type AuditEvent = {
  actorId?: Id<"users">;
  action: string;
  entityType: string;
  entityId: string;
  source: AuditSource;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
};

const SENSITIVE_KEYS = new Set([
  "password",
  "code",
  "token",
  "secret",
  "credentialId",
  "publicKey",
  "webauthnCredentials",
]);

export async function writeAuditLog(ctx: MutationCtx, event: AuditEvent) {
  const actor = event.actorId ? await ctx.db.get(event.actorId) : null;

  await ctx.db.insert("auditLogs", {
    actorId: event.actorId,
    actorRole: actor?.role,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    source: event.source,
    before: serializeAuditValue(event.before),
    after: serializeAuditValue(event.after),
    metadata: serializeAuditValue(event.metadata),
    createdAt: Date.now(),
  });
}

function serializeAuditValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return JSON.stringify(redact(value));
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      SENSITIVE_KEYS.has(key) ? "[REDACTED]" : redact(entry),
    ])
  );
}
