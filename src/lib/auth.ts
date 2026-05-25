export interface User {
  _id: string;
  email: string;
  name: string;
  role: "sahabat" | "mitra" | "verifikator" | "admin" | "corporate";
}

const SESSION_KEY = "idmap_session";

export function setSession(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getDashboardPath(role: User["role"]): string {
  switch (role) {
    case "admin": return "/admin";
    case "verifikator": return "/verifikator";
    case "mitra": return "/mitra";
default: return "/user";
  }
}
