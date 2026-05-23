import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";

const SYSTEM_PROMPT = `Kamu adalah ID-MAP Assistant, Customer Service resmi platform ID-MAP (Indonesian Mangrove Action Platform).

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

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }

  const userMessages = (body.messages ?? []).slice(-10); // max 10 pesan terakhir

  const nvidiaRes = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...userMessages,
      ],
      temperature: 0.6,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!nvidiaRes.ok) {
    const err = await nvidiaRes.text();
    console.error("NVIDIA API error:", err);
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
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const raw = decoder.decode(value, { stream: true });
          if (raw.includes("data: [DONE]")) break;

          // Parse SSE lines, filter teks delta, strip markdown
          const lines = raw.split("\n");
          let filtered = "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) { filtered += line + "\n"; continue; }
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
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
              filtered += line + "\n";
            }
          }
          controller.enqueue(encoder.encode(filtered));
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
