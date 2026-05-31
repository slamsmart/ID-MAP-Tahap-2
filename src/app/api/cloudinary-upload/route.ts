import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverSession";
import { rateLimit } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.cloudinary-upload");

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export async function POST(req: NextRequest) {
  // Auth: hanya logged-in user yang boleh upload. Mencegah penyalahgunaan
  // kuota Cloudinary + upload SVG XSS dari anonymous attacker.
  const session = getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Rate limit per-user — 30 upload / jam.
  const rl = rateLimit({
    bucket: "upload:user",
    key: session.uid,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: "Cloudinary env vars belum dikonfigurasi" },
      { status: 500 }
    );
  }

  const body = await req.formData();
  const file = body.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File terlalu besar (max ${MAX_BYTES / 1024 / 1024} MB).` },
      { status: 413 }
    );
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Tipe file tidak diizinkan. Hanya JPG/PNG/WebP/AVIF." },
      { status: 415 }
    );
  }

  // Cek ekstensi juga — MIME bisa di-spoof, tapi Cloudinary tetap akan
  // validate ulang server-side. Defense in depth.
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "Ekstensi file tidak diizinkan." },
      { status: 415 }
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "idmap/layanan");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    log.warn("cloudinary_upload_failed", {
      status: res.status,
      uid: session.uid,
      reason: err?.error?.message,
    });
    return NextResponse.json({ error: err?.error?.message ?? "Upload gagal" }, { status: 500 });
  }

  const data = await res.json();
  log.info("upload_ok", { uid: session.uid, size: file.size, type: file.type });
  return NextResponse.json({ url: data.secure_url });
}
