"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fpPromise: Promise<any> | null = null;

function initFP(): Promise<any> {
  if (fpPromise) return fpPromise;
  const apiKey = process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY;
  if (!apiKey) {
    fpPromise = Promise.resolve({ get: async () => ({ visitorId: "" }) });
    return fpPromise;
  }
  fpPromise = import("@fingerprint/agent").then((m) =>
    m.default.start({ apiKey })
  );
  return fpPromise;
}

/** Returns the Fingerprint Pro visitorId, or "" if not configured / failed. */
export async function getVisitorId(): Promise<string> {
  try {
    const fp = await initFP();
    const result = await fp.get();
    return result.visitorId ?? "";
  } catch {
    return "";
  }
}
