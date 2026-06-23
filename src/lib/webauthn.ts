"use client";

// ─── helpers ─────────────────────────────────────────────────────────────────

function base64urlEncode(buf: ArrayBuffer): string {
  return btoa(Array.from(new Uint8Array(buf), (c) => String.fromCharCode(c)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): ArrayBuffer {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0)).buffer as ArrayBuffer;
}

export function generateChallenge(): string {
  const buf = crypto.getRandomValues(new Uint8Array(32));
  return base64urlEncode(buf.buffer);
}

// ─── Detect ──────────────────────────────────────────────────────────────────

export function isWebAuthnAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof navigator.credentials?.create === "function"
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

export interface RegisterResult {
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceName: string;
}

export async function registerBiometric(opts: {
  userId: string;     // opaque user handle (email works)
  userName: string;
  displayName: string;
  challenge: string;  // base64url from server
  rpId?: string;
}): Promise<RegisterResult> {
  const rpId = opts.rpId ?? window.location.hostname;

  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: { name: "ID-MAP", id: rpId },
      user: {
        id: new TextEncoder().encode(opts.userId).buffer as ArrayBuffer,
        name: opts.userName,
        displayName: opts.displayName,
      },
      challenge: base64urlDecode(opts.challenge),
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",  // device biometric only
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential;

  if (!credential) throw new Error("Biometrik dibatalkan.");

  const response = credential.response as AuthenticatorAttestationResponse;
  const pubKeyBuf = response.getPublicKey?.();

  return {
    credentialId: base64urlEncode(credential.rawId),
    publicKey: pubKeyBuf ? base64urlEncode(pubKeyBuf) : "",
    counter: 0,
    deviceName: detectDeviceName(),
  };
}

// ─── Authentication ───────────────────────────────────────────────────────────

export async function verifyBiometric(opts: {
  challenge: string;
  credentialIds: string[];
  rpId?: string;
}): Promise<{ credentialId: string; counter: number }> {
  const rpId = opts.rpId ?? window.location.hostname;

  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: base64urlDecode(opts.challenge),
      rpId,
      allowCredentials: opts.credentialIds.map((id) => ({
        type: "public-key" as const,
        id: base64urlDecode(id),
      })),
      userVerification: "required",
      timeout: 60000,
    },
  })) as PublicKeyCredential;

  if (!credential) throw new Error("Verifikasi biometrik gagal.");

  const assertion = credential.response as AuthenticatorAssertionResponse;
  const counter = new DataView(assertion.authenticatorData).getUint32(33, false);

  return {
    credentialId: base64urlEncode(credential.rawId),
    counter,
  };
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function detectDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  const android = ua.match(/Android[^;]*;[^)]*\s([^;)]+)/)?.[1]?.trim();
  if (android) return android;
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Device";
}
