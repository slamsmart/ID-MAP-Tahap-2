// Client-side session helpers — server adalah sumber kebenaran.
// Cookie HttpOnly tidak bisa dibaca JS, jadi kita ambil sesi via
// /api/auth/me dan cache di memory module-level. Komponen yang baca
// session via getSession() tetap berjalan synchronous (return cache),
// dan refresh via refreshSession() / event "session:change".

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "sahabat" | "mitra" | "mitra_facilitator" | "verifikator" | "admin" | "corporate";
}

const LEGACY_KEY = "idmap_session";
let cached: User | null = null;
let bootstrapped = false;
let inflight: Promise<User | null> | null = null;

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("session:change"));
}

function readLegacy(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as User;
    return u && u._id && u.email && u.role ? u : null;
  } catch {
    return null;
  }
}

function clearLegacy() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_KEY);
}

export async function refreshSession(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  if (inflight) return inflight;
  inflight = fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
    .then(async (r) => {
      if (!r.ok) return null;
      const data = await r.json().catch(() => null);
      return (data?.user as User | null) ?? null;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  const u = await inflight;
  cached = u;
  bootstrapped = true;
  clearLegacy();
  emitChange();
  return cached;
}

// Sync getter — return cache. Jika belum bootstrap, kick off refresh
// di background dan sementara return data legacy (kalau ada) supaya
// halaman tidak flicker selama migrasi.
export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  if (!bootstrapped) {
    void refreshSession();
    if (!cached) cached = readLegacy();
  }
  return cached;
}

// Setter di sisi client tidak menulis cookie (hanya server bisa).
// Hanya update cache lokal — dipanggil setelah POST /api/auth/login
// atau /api/auth/register sukses (cookie sudah ditulis oleh server).
export function setSession(user: User | null): void {
  cached = user;
  bootstrapped = true;
  clearLegacy();
  emitChange();
}

export async function logout(): Promise<void> {
  cached = null;
  bootstrapped = true;
  clearLegacy();
  emitChange();
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch {
    // best-effort — cookie tetap akan expire
  }
}

export function getDashboardPath(role: User["role"]): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "verifikator":
      return "/verifikator";
    case "mitra":
    case "mitra_facilitator":
      return "/mitra";
    case "corporate":
      return "/corporate";
    default:
      return "/user";
  }
}
