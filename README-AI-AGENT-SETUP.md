# 🤖 AI Agent Setup Kit

> Starter kit minimal untuk semua project AI-assisted development.
> Cocok untuk Claude, Kiro, Cursor, GitHub Copilot, dan AI coding agents lainnya.

---

## 🎯 Kenapa Butuh Ini?

Tanpa setup yang benar, AI agent sering:
- ❌ Ngawur, ngarang arsitektur project
- ❌ Boros token (baca semua file padahal tidak perlu)
- ❌ Tidak konsisten dengan style code Anda
- ❌ Tidak tahu tools apa saja yang bisa dipakai

Dengan 3 file ini, AI agent jadi:
- ✅ Terarah (tahu aturan main)
- ✅ Hemat token (tahu di mana cari info)
- ✅ Konsisten (ikuti SOP project)
- ✅ Powerful (tahu tools yang tersedia)

---

## 📁 3 File Wajib

| File | Analogi | Fungsi |
|------|---------|--------|
| `AGENTS.md` | 🗒️ **SOP Pilot** | Aturan main, working mode, safety rules |
| `SYSTEM_MAP.md` | 🗺️ **Peta Wilayah** | Arsitektur project, lokasi file, alur runtime |
| `mcp.json` | 🛠️ **Panel Instrumen** | Daftar MCP tools yang bisa dipakai agent |

## 🎁 Bonus: Token Efficiency Tools

| Tool | Layer | Repo |
|------|-------|------|
| **Lean-Ctx** | Input (cara baca) | https://github.com/slamsmart/lean-ctx |
| **Caveman** | Output (cara respons) | https://github.com/slamsmart/caveman |

Install via `git clone <repo-url>` di root project.

---

## 🚀 Cara Setup (3 Langkah)

### Langkah 0: Install Token Efficiency Tools (Opsional tapi Direkomendasikan)

Untuk hemat token signifikan (~80%+ saving), install 2 tools ini di root project:

```bash
# Lean-Ctx (Input Layer) - hemat token saat baca file
git clone https://github.com/slamsmart/lean-ctx

# Caveman (Output Layer) - hemat token saat respons AI
git clone https://github.com/slamsmart/caveman
```

| Tool | Repo | Fungsi |
|------|------|--------|
| **Lean-Ctx** | https://github.com/slamsmart/lean-ctx | Replace native Read/Grep/Shell dengan versi compressed |
| **Caveman** | https://github.com/slamsmart/caveman | Cut output tokens ~75% dengan telegraphic style |

Kombinasi keduanya: **input compression + output compression = ~80-90% token saving**

Setelah clone, ikuti instruksi install di README masing-masing repo.

---

### Langkah 1: Buat AGENTS.md

Copy-paste prompt ini ke AI agent Anda:

```
Tolong buatkan AGENTS.md template di root project ini sebagai SOP untuk
AI agent. Isinya harus mencakup: working modes (review, implementation,
debugging, architecture, docs), token efficiency rules, editing
discipline, safety rules, dan project overrides section.
```

### Langkah 2: Buat SYSTEM_MAP.md

```
Tolong buatkan SYSTEM_MAP.md di root project ini sebagai peta
arsitektur. Isinya: project snapshot, tech stack, top-level layout,
entry points, runtime flows, boundaries, integration points, dan
key files. Biarkan template kosong dulu, nanti saya isi sesuai project.
```

### Langkah 3: Buat mcp.json

```
Tolong buatkan mcp.json di root project ini dengan MCP servers basic:
filesystem, fetch, playwright, memory, dan sequential thinking. Format
JSON standar Model Context Protocol.
```

Setelah 3 file ini ada, agent Anda langsung punya konteks untuk bekerja efisien.

---

## 📝 Customization Per Project

Setelah template tergenerate, isi bagian project-specific:

### Di `AGENTS.md` — Project Overrides:
```yaml
- Primary stack: [Next.js/React/Vue/dll]
- Main app entry: [path/ke/entry-file]
- Main API entry: [path/ke/api]
- Auth model: [JWT/session/OAuth/dll]
- Data source: [Postgres/MongoDB/Convex/dll]
- Sensitive areas: [.env, secrets, dll]
```

### Di `SYSTEM_MAP.md` — Isi sesuai struktur project:
- Tech Stack (Frontend, Backend, Database, dll)
- Entry Points (Web, API, Worker, CLI)
- Runtime Flows (Auth, Business, Payment, dll)
- Integration Points (Provider eksternal)

### Di `mcp.json` — Tambah MCP server sesuai kebutuhan:
- **Web app** → tambah GitHub, Vercel
- **Database project** → tambah Postgres/MongoDB MCP
- **GIS project** → tambah GDAL, Earth Engine MCP
- **AI/ML project** → tambah Python execution MCP

---

## 🎓 Tahapan Adoption

### Tahap 1: General Template (Untuk semua project)
- Pakai 3 file template apa adanya
- Cocok untuk project baru, exploration, MVP

### Tahap 2: Project-Specific (Setelah project matang)
- Isi Project Overrides di AGENTS.md
- Populate SYSTEM_MAP.md dengan arsitektur aktual
- Tambah MCP server yang spesifik

### Tahap 3: Team Standard (Untuk tim/organisasi)
- Standardisasi 3 file ini sebagai bagian dari project template
- Masukkan ke `git template` atau `cookiecutter`
- Setiap project baru otomatis punya setup ini

---

## 💡 Tips Penggunaan

**Buat AI agent baca AGENTS.md duluan:**
> Awali setiap percakapan dengan: "Ikuti aturan di AGENTS.md, gunakan SYSTEM_MAP.md untuk navigasi arsitektur."

**Update SYSTEM_MAP.md saat arsitektur berubah:**
> Tambah/edit entrypoints, flows, atau boundaries yang baru. AI agent akan otomatis pakai info terbaru.

**Tambah MCP server sesuai kebutuhan:**
> Mulai minimal (5 server basic), tambah sesuai project butuh. Jangan over-engineer dari awal.

---

## 🔍 Contoh Hasil

Setelah setup, Anda bisa minta AI:

```
"Review code di src/auth/login.ts"
→ Agent baca SYSTEM_MAP.md untuk konteks auth flow
→ Agent baca AGENTS.md untuk format review yang benar
→ Pakai filesystem MCP untuk baca file
→ Output: findings prioritized by severity
```

```
"Tambahkan endpoint baru untuk feature X"
→ Agent cek SYSTEM_MAP.md untuk pattern API existing
→ Ikuti AGENTS.md: minimal change, preserve architecture
→ Pakai filesystem MCP untuk edit file
→ Verifikasi via diagnostics
```

---

## 📦 File Structure

```
your-project/
├── AGENTS.md              ← SOP Agent
├── SYSTEM_MAP.md          ← Peta Arsitektur
├── mcp.json               ← MCP Tools Config
├── lean-ctx/              ← (opsional) Input compression tools
├── caveman/               ← (opsional) Output compression tools
├── README.md              ← Project README (existing)
└── ... (project files)
```

---

## ❓ FAQ

**Q: Kalau project sudah ada README, butuh README ini juga?**
A: Tidak. README ini hanya untuk dokumentasi setup AI agent. Sertakan di project starter atau dokumentasi internal saja.

**Q: Apakah harus pakai semua MCP server?**
A: Tidak. 5 server basic sudah cukup untuk 80% kasus. Tambah hanya saat butuh.

**Q: Bagaimana kalau project saya bukan web app?**
A: Tetap pakai. Customize SYSTEM_MAP.md sesuai jenis project (mobile, CLI, ML, dll).

**Q: Apa beda dengan dokumentasi biasa?**
A: 3 file ini khusus untuk AI agent — formatnya, strukturnya, dan kontennya dirancang agar agent bisa pakai langsung tanpa interpretasi tambahan.

---

## 🚦 Status

✅ Template ready untuk dipakai
✅ Compatible dengan major AI coding agents (Claude, Kiro, Cursor, Copilot)
✅ Open source — bebas digunakan dan dimodifikasi

---

**Dibuat oleh:** Tim ID-MAP
**Lisensi:** Bebas pakai untuk project apa saja
**Update terakhir:** 2026
