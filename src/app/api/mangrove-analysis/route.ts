import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildMangroveContext,
  DATA_PROVINSI,
  RINGKASAN_NASIONAL as R,
  PROGRAM_RESTORASI,
  ANCAMAN_MANGROVE,
} from "@/lib/mangroveNasionalData";
import { rateLimit } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.mangrove-analysis");

/** Context ringkas (~40% lebih sedikit token dari buildMangroveContext() */
function buildShortContext(): string {
  const kritis = DATA_PROVINSI
    .filter((p) => p.kondisi === "kritis")
    .sort((a, b) => b.luasDegradasi - a.luasDegradasi)
    .slice(0, 5)
    .map((p) => `${p.provinsi}(${p.luasDegradasi.toLocaleString("id-ID")}ha,${p.persenRealisasi}%)`)
    .join(", ");

  const program = PROGRAM_RESTORASI
    .map((p) => `${p.nama}:${Math.round((p.realisasiHektar / p.targetHektar) * 100)}%`)
    .join(", ");

  const ancaman = ANCAMAN_MANGROVE
    .filter((a) => a.tingkat === "tinggi")
    .map((a) => a.jenis)
    .join(", ");

  return `DATA MANGROVE 2025: luas ${R.totalLuasMangrove.toLocaleString("id-ID")}ha, degradasi ${R.luasDegradasi.toLocaleString("id-ID")}ha, realisasi restorasi ${R.persenRealisasi}% dari target ${R.targetRestorasiTotal.toLocaleString("id-ID")}ha. KKMD: ${R.jumlahKKMDProvinsi} prov/${R.jumlahKKMDKabupaten} kab. NDC 2030: ${R.TargetNDC_2030.toLocaleString("id-ID")}ha.
KRITIS: ${kritis}.
PROGRAM: ${program}.
ANCAMAN: ${ancaman}.`;
}

// Provider config — NVIDIA NIM (primary) / OpenRouter (fallback)
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const nvidiaClient = NVIDIA_KEY
  ? new OpenAI({
      apiKey: NVIDIA_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    })
  : null;

const openrouterClient = new OpenAI({
  apiKey: OPENROUTER_KEY ?? "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://id-map.vercel.app",
    "X-Title": "ID-MAP Mangrove Analysis",
  },
});

// NVIDIA NIM — model chain (diurutkan berdasarkan benchmark kecepatan)
const NVIDIA_MODELS = [
  "meta/llama-3.1-8b-instruct",       // 949ms  — tercepat
  "mistralai/mistral-7b-instruct-v0.3", // 2201ms — fallback 1
  "deepseek-ai/deepseek-v4-flash",      // 2349ms — fallback 2
];

// OpenRouter — fallback chain (confirmed available)
const OPENROUTER_MODELS = [
  "deepseek/deepseek-v4-flash:free",
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

export async function POST(request: NextRequest) {
  // Rate limit per-IP — endpoint ini lebih mahal (analisis panjang),
  // jadi lebih ketat: 10/menit. Mencegah bot drain kuota OpenRouter.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit({ bucket: "mangrove-analysis:ip", key: ip, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    log.warn("analysis_rate_limited", { ip, retryAfterMs: rl.retryAfterMs });
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { fokus = "umum", role = "admin" } = body as {
      fokus?: "umum" | "restorasi" | "ancaman" | "karbon" | "kkmd" | "kebijakan";
      role?: string;
    };

    const konteksData = buildShortContext();

    const fokulabel: Record<string, string> = {
      umum: "analisis umum + rekomendasi",
      restorasi: "progress restorasi & gap PMN/BRGMN",
      ancaman: "ancaman kritis & mitigasi",
      karbon: "blue carbon & carbon credit",
      kkmd: "penguatan KKMD",
      kebijakan: "rekomendasi kebijakan & program prioritas nasional",
    };

    const instruksiFokus = fokulabel[fokus] ?? fokulabel.umum;

    const isKebijakan = fokus === "kebijakan";
    const systemPrompt = isKebijakan
      ? `Pakar kebijakan mangrove nasional. Jawab SINGKAT, PADAT, LANGSUNG TO THE POINT.

WAJIB: Maksimal 250 kata. Tanpa pengantar/penutup.

Format (ikuti persis):
## Isu Kebijakan Utama
- isu 1
- isu 2

## Rekomendasi Kebijakan
- kebijakan 1
- kebijakan 2
- kebijakan 3

## Program Prioritas
- program 1
- program 2
- program 3`
      : `Analis mangrove BRGMN. Jawab SINGKAT, PADAT, LANGSUNG TO THE POINT.

WAJIB: Maksimal 250 kata total. Tanpa pengantar/penutup.

Format (ikuti persis):
## Kondisi Terkini
1-2 kalimat.

## Temuan Kunci
- poin 1
- poin 2
- poin 3

## Rekomendasi
- rekomendasi 1
- rekomendasi 2
- rekomendasi 3`;


    const userMessage = `${konteksData}

---
Fokus: ${instruksiFokus}. Role: ${role}.`;

    // Coba provider satu per satu — NVIDIA dulu, lalu OpenRouter
    type StreamResult = Awaited<ReturnType<typeof openrouterClient.chat.completions.create>>;
    let stream: StreamResult | null = null;
    let lastError: any = null;

    const providers: Array<{ client: OpenAI; models: string[] }> = [
      ...(nvidiaClient ? [{ client: nvidiaClient, models: NVIDIA_MODELS }] : []),
      { client: openrouterClient, models: OPENROUTER_MODELS },
    ];

    outer:
    for (const { client, models } of providers) {
      for (const model of models) {
        try {
          stream = await client.chat.completions.create({
            model,
            max_tokens: 280,
            temperature: 0,
            stream: true,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });
          break outer; // berhasil, hentikan semua loop
        } catch (err: any) {
          lastError = err;
          const status = err?.status ?? err?.statusCode;
          // Lanjut fallback jika model tidak tersedia (404) atau rate limit (429)
          if (status !== 404 && status !== 429) throw err;
        }
      }
    }

    if (!stream) throw lastError ?? new Error("Semua model tidak tersedia");

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Mangrove AI error:", error);
    const status = error?.status ?? error?.statusCode ?? 500;
    const message =
      error?.message?.includes("402") || status === 402
        ? "Model AI sedang tidak tersedia. Coba lagi dalam beberapa saat."
        : (error?.message ?? "Terjadi kesalahan pada analisis AI");
    return NextResponse.json({ error: message }, { status: status === 402 ? 503 : 500 });
  }
}
