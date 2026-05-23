import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildMangroveContext } from "@/lib/mangroveNasionalData";

// OpenRouter — supports free models (deepseek/gemini/etc)
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    "X-Title": "ID-MAP Mangrove Platform",
  },
});

// Model default: DeepSeek V3 free (bisa ganti via env OPENROUTER_MODEL)
const MODEL = process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash:free";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fokus = "umum", role = "admin" } = body as {
      fokus?: "umum" | "restorasi" | "ancaman" | "karbon" | "kkmd";
      role?: string;
    };

    const konteksData = buildMangroveContext();

    const fokulabel: Record<string, string> = {
      umum: "analisis menyeluruh dan rekomendasi program kelanjutan ekosistem mangrove",
      restorasi: "progress restorasi, gap pencapaian, dan akselerasi target PMN/BRGMN 2025-2030",
      ancaman: "pemetaan ancaman kritis dan strategi mitigasi berbasis komunitas",
      karbon: "potensi blue carbon, carbon credit, dan pembiayaan inovatif mangrove",
      kkmd: "penguatan Kelompok Kerja Mangrove Daerah dan koordinasi multi-pihak",
    };

    const instruksiFokus = fokulabel[fokus] ?? fokulabel.umum;

    const systemPrompt = `Kamu adalah analis ekosistem mangrove senior dari BRGMN (Badan Restorasi Gambut dan Mangrove Nasional) Indonesia. Tugas kamu adalah memberikan analisis mendalam dan rekomendasi strategis berdasarkan data real PMN, KKMD, dan BRGMN tahun 2025.

Gunakan bahasa Indonesia yang profesional namun mudah dipahami. Struktur respons dengan markdown (heading, bullet points, tabel jika perlu). Fokus pada rekomendasi yang konkret dan dapat ditindaklanjuti.

Format respons:
## Kondisi Terkini
(ringkasan 2-3 kalimat kondisi mangrove nasional)

## Temuan Kunci
(3-5 poin temuan paling kritis)

## Analisis [topik fokus]
(analisis mendalam sesuai fokus)

## Rekomendasi Strategis
(rekomendasi prioritas untuk program kelanjutan, terstruktur per horizon waktu: jangka pendek/menengah/panjang)

## Sinkronisasi Data & Pelaporan
(bagaimana platform ID-MAP dapat berkontribusi dalam sinkronisasi data mangrove nasional)`;

    const userMessage = `${konteksData}

---
Berikan ${instruksiFokus} berdasarkan data di atas.
Konteks pengguna: role "${role}" pada platform ID-MAP (sistem informasi mangrove pesisir Indonesia).
Perhatikan khusus provinsi-provinsi kondisi kritis dan gap realisasi restorasi yang masih signifikan.`;

    // Streaming response via OpenRouter
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1500,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

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
    return NextResponse.json(
      { error: error.message ?? "Terjadi kesalahan pada analisis AI" },
      { status: 500 }
    );
  }
}
