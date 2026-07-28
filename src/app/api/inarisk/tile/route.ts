import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy tile raster BNPB inaRISK bahaya banjir (server-side fetch + cache).
 *
 * Beberapa environment (mis. Vercel US/iad1) tidak bisa langsung reach
 * gis.bnpb.go.id (timeout). Route ini fetch di server, hasilnya dicache agresif
 * sehingga tile identik (bbox+size sama) diulang tinggal dari cache.
 *
 * Query params: bbox=w,s,e,n&size=W,H (forwarded as-is to ArcGIS export).
 * Response: PNG transparan dari ArcGIS, plus Cache-Control panjang.
 */
const INARISK_BANJIR_EXPORT =
  "https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir_30/MapServer/export";

const FETCH_TIMEOUT_MS = 10_000;

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
    return NextResponse.json({ error: "bbox=west,south,east,north required" }, { status: 400 });
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
    return NextResponse.json({ error: "bbox out of Indonesia bounds" }, { status: 400 });
  }
  const sizeW = Math.round(Number(sp.get("sizeW") || sp.get("w") || 256));
  const sizeH = Math.round(Number(sp.get("sizeH") || sp.get("h") || sizeW));
  if (!isValidSize(sizeW) || !isValidSize(sizeH)) {
    return NextResponse.json({ error: "size out of range (1..2048)" }, { status: 400 });
  }
  // Normalized: round bbox & size → maximise cache hit rate across clients.
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
    // Validate: ArcGIS error as JSON often slips through ok on bad params.
    if (ctype.includes("json") || buf.length < 64) {
      return NextResponse.json(
        { error: "BNPB returned non-image body", bytes: buf.length },
        { status: 502 }
      );
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": ctype,
        // Tile raster BNPB statis per (bbox,size) → cache panjang.
        // Browser cache s-maxage 1 hari, plus SWR 7 hari.
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "X-InaRisk-Tile": "proxy",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "tile fetch failed";
    return NextResponse.json({ error: msg }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
