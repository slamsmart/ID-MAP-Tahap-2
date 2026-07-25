import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOLERANCE = 20;
const INARISK_BANJIR_IDENTIFY =
  "https://gis.bnpb.go.id/server/rest/services/inarisk/layer_bahaya_banjir_30/MapServer/identify";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }
  if (lat < -11 || lat > 6 || lng < 95 || lng > 141) {
    return NextResponse.json({ error: "coordinates out of Indonesia bounds" }, { status: 400 });
  }

  const pad = 0.35;
  const tolerance = Math.min(
    MAX_TOLERANCE,
    Math.max(3, Number(sp.get("tolerance") || 8) || 8)
  );
  const mapExtent = `${lng - pad},${lat - pad},${lng + pad},${lat + pad}`;
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    sr: "4326",
    layers: "all:0",
    tolerance: String(tolerance),
    mapExtent,
    imageDisplay: "512,512,96",
    returnGeometry: "false",
    f: "json",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${INARISK_BANJIR_IDENTIFY}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `BNPB identify HTTP ${res.status}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      results?: Array<{
        layerId?: number;
        layerName?: string;
        attributes?: Record<string, unknown>;
      }>;
      error?: { message?: string };
    };
    if (data.error?.message) {
      return NextResponse.json({ error: data.error.message }, { status: 502 });
    }
    const first = data.results?.[0];
    return NextResponse.json(
      {
        ok: true,
        lat,
        lng,
        layerName: first?.layerName ?? null,
        attributes: first?.attributes ?? null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "identify failed";
    return NextResponse.json({ error: msg }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
