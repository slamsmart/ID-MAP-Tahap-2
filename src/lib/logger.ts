// Structured JSON logger — single-line emit untuk gampang di-parse oleh
// Vercel Logs / Datadog / Loki. Sengaja minimalis: tidak ada transport
// pluggable, tidak ada level filter di runtime. Production migration ke
// pino/winston straightforward — tinggal ganti `emit()` body.

type Level = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

const ENABLED_LEVELS: Record<Level, boolean> = {
  debug: process.env.NODE_ENV !== "production",
  info: true,
  warn: true,
  error: true,
};

function emit(level: Level, scope: string, msg: string, fields?: LogFields) {
  if (!ENABLED_LEVELS[level]) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    msg,
    ...sanitize(fields ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// Buang field sensitif (password, token, otp) sebelum serialisasi.
const REDACT_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "otp",
  "code",
]);

function sanitize(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (REDACT_KEYS.has(k.toLowerCase())) {
      out[k] = "[redacted]";
    } else if (v instanceof Error) {
      out[k] = { name: v.name, message: v.message };
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function createLogger(scope: string) {
  return {
    debug: (msg: string, fields?: LogFields) => emit("debug", scope, msg, fields),
    info: (msg: string, fields?: LogFields) => emit("info", scope, msg, fields),
    warn: (msg: string, fields?: LogFields) => emit("warn", scope, msg, fields),
    error: (msg: string, fields?: LogFields) => emit("error", scope, msg, fields),
  };
}

export type Logger = ReturnType<typeof createLogger>;
