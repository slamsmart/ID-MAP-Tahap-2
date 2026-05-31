import { NextRequest, NextResponse } from "next/server";
import { rateLimitAsync } from "@/lib/rateLimit";
import { createLogger } from "@/lib/logger";

const log = createLogger("api.chat");
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// Fallback chain — diurutkan berdasarkan kecepatan TTFT
const NVIDIA_MODELS = [
  "meta/llama-3.1-8b-instruct",          // ~949ms  — primary
  "mistralai/mistral-7b-instruct-v0.3",  // ~2201ms — fallback 1
  "deepseek-ai/deepseek-v4-flash",       // ~2349ms — fallback 2
];

const SYSTEM_PROMPT = `Kamu adalah ID-MAP Assistant, Customer Service resmi platform ID-MAP (Integrasi Data dan Manajemen Pesisir).

Fokus utama yang harus kamu kuasai dan jelaskan:
- Integrasi data mangrove dan ekosistem pesisir pada platform ID-MAP
- Program restorasi mangrove: PMN, BRGMN, KKMD, dan kegiatan lapangan
- Keberlanjutan program: monitoring, MRV, pelaporan kondisi ekosistem
- Dampak nyata ke masyarakat pesisir: pemberdayaan Pokmaswas, nelayan, dan petambak
- Perlindungan habitat: penyu, abrasi pantai, keanekaragaman hayati pesisir
- Proses registrasi proyek dan verifikasi untuk mitra (NGO/kelompok masyarakat)

Hindari:
- Jangan terlalu banyak membahas carbon credit atau harga karbon — hanya sebut jika ditanya langsung
- Jangan bahas angka finansial spesifik atau janji imbal hasil

Aturan WAJIB:
- Gunakan bahasa Indonesia yang hangat, ramah, dan sopan seperti CS profesional
- DILARANG KERAS menggunakan tanda bintang (*), pagar (#), underscore (_), atau simbol markdown apapun
- Jika jawaban banyak poin, gunakan angka: 1. 2. 3. dst — bukan tanda hubung atau bintang
- Sesuaikan panjang jawaban dengan kompleksitas pertanyaan — singkat untuk pertanyaan sederhana, lebih panjang untuk pertanyaan detail (maksimal 500 kata)
- WAJIB selalu selesaikan kalimat hingga titik — jangan pernah berhenti di tengah kata atau kalimat
- Jawab langsung ke inti pertanyaan, tidak bertele-tele
- Jangan tambahkan segmentasi role di akhir jawaban kecuali ditanya

Pengecualian topik di luar konteks:
Jika pengguna mengajukan pertanyaan yang sama sekali tidak berkaitan dengan mangrove, ekosistem pesisir, program restorasi, atau platform ID-MAP (misalnya: politik, hiburan, teknologi umum, resep masakan, olahraga, dan sejenisnya), maka WAJIB jawab dengan kalimat seperti berikut ini — sesuaikan kata-katanya agar terasa tulus dan natural:

"Mohon maaf, pertanyaan Anda sepertinya berada di luar cakupan layanan kami. ID-MAP Assistant hadir khusus untuk membantu hal-hal seputar program mangrove, ekosistem pesisir, dan kegiatan konservasi di Indonesia. Apakah ada yang bisa saya bantu terkait topik tersebut? Kami dengan senang hati siap membantu Anda."

Jangan pernah menjawab pertanyaan di luar konteks mangrove dan pesisir, meskipun pengguna memaksa atau bertanya berulang kali.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NVIDIA API key tidak dikonfigurasi" }, { status: 500 });
  }

  // Rate limit per-IP — 20 chat/menit. Mencegah bot abuse + habisin
  // kuota NVIDIA. User normal jarang chat lebih dari sekali per detik.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await rateLimitAsync({ bucket: "chat:ip", key: ip, limit: 20, windowMs: 60_000 });
  if (!rl.ok) {
    log.warn("chat_rate_limited", { ip, retryAfterMs: rl.retryAfterMs });
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }

  // Buang system messages yang dikirim user — hanya server yang boleh
  // set system prompt. Ini mitigasi prompt injection ringan; user masih
  // bisa coba inject via content message biasa, tapi system prompt tidak
  // bisa di-override.
  const userMessages = (body.messages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-6);

  // Coba model satu per satu — berhenti saat berhasil
  let nvidiaRes: Response | null = null;
  let lastError = "";
  for (const model of NVIDIA_MODELS) {
    try {
      const res = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...userMessages,
          ],
          temperature: 0.6,
          max_tokens: 800,
          stream: true,
        }),
      });
      if (res.ok) { nvidiaRes = res; break; }
      const status = res.status;
      lastError = `${model} → HTTP ${status}`;
      // Lanjut fallback hanya untuk 404 (model tidak ada) atau 429 (rate limit)
      if (status !== 404 && status !== 429) break;
    } catch (e: any) {
      lastError = e?.message ?? String(e);
    }
  }

  if (!nvidiaRes) {
    console.error("Semua model gagal:", lastError);
    return NextResponse.json({ error: "Gagal menghubungi AI" }, { status: 502 });
  }

  // Strip karakter markdown (* # _ ` ~) dari teks sebelum dikirim ke client
  function stripMarkdown(text: string): string {
    return text.replace(/[*#_`~]/g, "");
  }

  // Forward streaming response ke client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = nvidiaRes.body!.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = ""; // buffer SSE lines yang belum lengkap
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });

          // Simpan baris terakhir yang mungkin belum lengkap
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";

          // Parse SSE lines, filter teks delta, strip markdown
          let filtered = "";
          let isDone = false;
          for (const line of lines) {
            if (!line.startsWith("data: ")) { filtered += line + "\n"; continue; }
            const json = line.slice(6).trim();
            if (json === "[DONE]") { isDone = true; break; }
            try {
              const parsed = JSON.parse(json);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) {
                parsed.choices[0].delta.content = stripMarkdown(delta);
                filtered += "data: " + JSON.stringify(parsed) + "\n";
              } else {
                filtered += line + "\n";
              }
            } catch {
              // baris parsial — sudah di-handle oleh lineBuffer, skip
            }
          }
          if (filtered) controller.enqueue(encoder.encode(filtered));
          if (isDone) break;
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
