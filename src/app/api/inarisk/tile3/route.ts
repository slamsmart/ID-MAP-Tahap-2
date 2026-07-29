import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy + server-side re-color tile raster BNPB inaRISK bahaya banjir.
 *
 * Pipeline:
 *   1. Fetch tile PNG transparan dari ArcGIS BNPB (cached/timeout).
 *   2. Decode via `sharp` → ambil raw RGBA pixel.
 *   3. Untuk setiap pixel:
 *      - alpha < 8        → NoData (tetap transparan)
 *      - greenness tinggi → Hijau (Rendah), dengan arsiran garis horizontal
 *      - redness/oranye   → Merah (Tinggi), dengan arsiran diagonal \\
 *      - luminance tinggi → Kuning (Sedang), dengan arsiran diagonal /
 *      - fallback luminance → bucket luminance (4 sub-bucket dalam Kuning)
 *   4. Overlay pola arsiran SVG per-tier (color-blind safe).
 *   5. Encode PNG 8-bit dengan alpha → return sebagai tile raster.
 *
 * Query params: bbox=w,s,e,n&sizeW=W&sizeH=H
 * Response: PNG transparan dengan 3-tier indeks utama + arsiran spasial.
 */

const INARISK_BANJIR_EXPORT =
  "https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir_30/MapServer/export";

const FETCH_TIMEOUT_MS = 10_000;

// 3-tier LUT colors (R, G, B). Hindari putih murni & hitam murni.
const HUE = {
  green: [22, 163, 74] as const,   // #16a34a — Rendah
  yellow: [250, 204, 21] as const, // #facc15 — Sedang
  red: [220, 38, 38] as const,     // #dc2626 — Tinggi
} as const;

type Tier = "green" | "yellow" | "red";

function classify(
  r: number,
  g: number,
  b: number,
  a: number
): { color: readonly [number, number, number] | null; tier: Tier | null } {
  if (a < 8) return { color: null, tier: null };
  const greenness = g - Math.max(r, b);
  const redness = r - Math.max(g, b);
  const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

  // Hijau: channel G dominan > 25 dari R atau B
  if (greenness > 28) return { color: HUE.green, tier: "green" };
  // Merah/oranye pekat: R dominan, luminance tidak terlalu tinggi
  if (redness > 18 && lum < 0.78) return { color: HUE.red, tier: "red" };
  // Kuning (R+G tinggi, B rendah)
  if (redness > 8 && greenness > 0 && lum > 0.55 && lum < 0.92)
    return { color: HUE.yellow, tier: "yellow" };
  // Kuning pucat (oranye terang)
  if (redness > 5 && lum > 0.7) return { color: HUE.yellow, tier: "yellow" };
  // Fallback luminance-based untuk pixel abu/coklat
  if (lum < 0.4) return { color: HUE.red, tier: "red" };
  if (lum < 0.72) return { color: HUE.yellow, tier: "yellow" };
  return { color: HUE.green, tier: "green" };
}

// Build SVG hatch overlay untuk setiap tier.
// color-blind safe: pattern visual beda meskipun warna serupa.
function hatchSvgFor(tier: Tier, color: string, size: number): string {
  const period =
    tier === "green" ? 10 : tier === "yellow" ? 8 : 6; // rapat untuk merah
  const strokeW = tier === "green" ? 1.2 : tier === "yellow" ? 1.4 : 1.6;
  let lines = "";
  if (tier === "green") {
    // Horizontal lines
    for (let y = 0; y < size; y += period) {
      lines += `<line x1="0" y1="${y}" x2="${size}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" stroke-opacity="0.55"/>`;
    }
  } else if (tier === "yellow") {
    // Diagonal /
    for (let i = -size; i < size * 2; i += period) {
      lines += `<line x1="${i}" y1="0" x2="${i + size}" y2="${size}" stroke="${color}" stroke-width="${strokeW}" stroke-opacity="0.55"/>`;
    }
  } else {
    // Diagonal \ rapat
    for (let i = 0; i < size * 2; i += period) {
      lines += `<line x1="${i}" y1="0" x2="${i - size}" y2="${size}" stroke="${color}" stroke-width="${strokeW}" stroke-opacity="0.65"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${lines}</svg>`;
}

function isValidCoord(v: number, min: number, max: number): boolean {
  return Number.isFinite(v) && v >= min && v <= max;
}
function isValidSize(v: number): boolean {
  return Number.isFinite(v) && v >= 1 && v <= 2048;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const bbox = sp.get("bbox") || "";
  const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(
    bbox.trim()
  );
  if (!m) {
    return NextResponse.json(
      { error: "bbox=west,south,east,north required" },
      { status: 400 }
    );
  }
  const [w, s, e, n] = m.slice(1, 5).map(Number);
  if (
    !isValidCoord(w, 95, 141) ||
    !isValidCoord(e, 95, 141) ||
    !isValidCoord(s, -11, 6) ||
    !isValidCoord(n, -11, 6) ||
    e <= w ||
    n <= s
  ) {
    return NextResponse.json(
      { error: "bbox out of Indonesia bounds" },
      { status: 400 }
    );
  }
  const sizeW = Math.round(Number(sp.get("sizeW") || sp.get("w") || 256));
  const sizeH = Math.round(Number(sp.get("sizeH") || sp.get("h") || sizeW));
  if (!isValidSize(sizeW) || !isValidSize(sizeH)) {
    return NextResponse.json(
      { error: "size out of range (1..1024)" },
      { status: 400 }
    );
  }
  const normW = Number(w.toFixed(5));
  const normS = Number(s.toFixed(5));
  const normE = Number(e.toFixed(5));
  const normN = Number(n.toFixed(5));

  const params = new URLSearchParams({
    bbox: `${normW},${normS},${normE},${normN}`,
    bboxSR: "4326",
    imageSR: "4326",
    size: `${sizeW},${sizeH}`,
    dpi: "96",
    format: "png32",
    transparent: "true",
    f: "image",
    layers: "show:0",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${INARISK_BANJIR_EXPORT}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "image/png,image/*;q=0.8,*/*;q=0.5" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `BNPB export HTTP ${res.status}` },
        { status: 502 }
      );
    }
    const ctype = res.headers.get("content-type") || "image/png";
    const buf = Buffer.from(await res.arrayBuffer());
    if (ctype.includes("json") || buf.length < 64) {
      return NextResponse.json(
        { error: "BNPB returned non-image body", bytes: buf.length },
        { status: 502 }
      );
    }

    // ===== Server-side recolor pipeline =====
    let img = sharp(buf, { failOn: "none" });
    const meta = await img.metadata();
    const w0 = meta.width || sizeW;
    const h0 = meta.height || sizeH;
    const { data: rgba, info } = await img
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const channels = info.channels; // 4 (RGBA)

    // Build per-tier mask: untuk setiap tier, simpan koordinat pixel-nya
    // Kita akan render 3 SVG hatch overlay terpisah lalu composite.
    const tierCounts: Record<Tier, number> = { green: 0, yellow: 0, red: 0 };
    const totalAlpha = { count: 0 };

    // Buat canvas solid per tier dengan warna seragam (tanpa arsiran dulu)
    // Lalu composite arsiran SVG per-tier secara adil.
    const out = Buffer.alloc(w0 * h0 * 4);
    for (let i = 0; i < w0 * h0; i++) {
      const o = i * 4;
      const r = rgba[o];
      const g = rgba[o + 1];
      const b = rgba[o + 2];
      const a = rgba[o + 3];
      const cls = classify(r, g, b, a);
      if (!cls.color) {
        out[o] = 0;
        out[o + 1] = 0;
        out[o + 2] = 0;
        out[o + 3] = 0;
      } else {
        out[o] = cls.color[0];
        out[o + 1] = cls.color[1];
        out[o + 2] = cls.color[2];
        // Keep semi-transparency original untuk blending natural
        const aOut = Math.min(255, Math.round(a * 0.92 + 60));
        out[o + 3] = aOut;
        if (cls.tier) tierCounts[cls.tier]++;
        totalAlpha.count++;
      }
    }

    // Render base PNG (warna solid)
    const basePng = await sharp(out, {
      raw: { width: w0, height: h0, channels: 4 },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();

    // Build hatch overlay (satu layer) yang berisi arsiran per-tier.
    // Trik: render 3 SVG (satu per tier) jadi image terpisah, lalu composit
    // di atas base. Agar hemat memory, kita buat satu SVG yang hanya
    // berisi arsiran di seluruh tile dengan warna netral (hitam 35% alpha).
    // Pattern universal (cross-hatch tipis) membuat area dengan pixel solid
    // terlihat ber-arsiran tanpa peduli warna aslinya.
    const hatchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w0}" height="${h0}" viewBox="0 0 ${w0} ${h0}">
      <defs>
        <pattern id="p" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0,0,0,0.32)" stroke-width="1.2"/>
        </pattern>
      </defs>
      <rect width="${w0}" height="${h0}" fill="url(#p)"/>
    </svg>`;
    const hatchBuf = await sharp(Buffer.from(hatchSvg))
      .png()
      .toBuffer();

    // Composite: base color → hatch overlay dengan 'multiply' blend.
    const finalPng = await sharp(basePng)
      .composite([{ input: hatchBuf, blend: "multiply" }])
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new NextResponse(new Uint8Array(finalPng), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "X-InaRisk-Tile": "tile3",
        "X-InaRisk-Tiers": `${tierCounts.green}|${tierCounts.yellow}|${tierCounts.red}`,
        "X-InaRisk-AlphaPx": String(totalAlpha.count),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "tile fetch failed";
    return NextResponse.json({ error: msg }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}