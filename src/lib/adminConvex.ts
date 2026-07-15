type AdminContentOperation =
  | "about.update"
  | "faq.update"
  | "footer.update"
  | "landingHero.update"
  | "roles.update"
  | "service.update"
  | "service.generateUploadUrl";

type AdminSeedOperation =
  | "seedAll"
  | "resetAndSeed"
  | "seedPokmaswasProjects"
  | "seedDummyCertificates"
  | "seedGamificationDummy"
  | "partnerOrganizations.seedPilot";

async function postAdmin<T>(
  url: string,
  body: Record<string, unknown>,
  fallbackMessage: string
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as
    | { result?: T; error?: string }
    | null;

  if (!res.ok) {
    throw new Error(json?.error ?? fallbackMessage);
  }

  return json?.result as T;
}

export function callAdminContent<T = null>(
  operation: AdminContentOperation,
  payload?: unknown
): Promise<T> {
  return postAdmin<T>(
    "/api/admin/content",
    { operation, payload },
    "Gagal menjalankan operasi admin."
  );
}

export function callAdminSeed(operation: AdminSeedOperation): Promise<string> {
  return postAdmin<string>(
    "/api/admin/seed",
    { operation },
    "Gagal menjalankan seed admin."
  );
}
