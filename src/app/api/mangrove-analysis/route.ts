import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildMangroveContext } from "@/lib/mangroveNasionalData";

const client = new Anthropic();

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

    // Streaming response
    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
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
