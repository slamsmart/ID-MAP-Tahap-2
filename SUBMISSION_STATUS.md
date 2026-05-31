# Status Submission Tahap 2 — ID-MAP

**Tanggal update:** 2026-05-31
**URL Production utama:** https://www.id-map.app (custom domain via Cloudflare)
**URL Vercel:** https://idmap-pesisir.vercel.app
**Repo:** https://github.com/slamsmart/ID-MAP-Tahap-2

## Current Status: Functional Prototype

Status proyek berada di antara **Prototype** dan **Pilot**. Bukti yang membedakan dari mockup biasa:

- **Frontend + backend nyata** (Next.js 14 + Convex), bukan mockup
- **Auth OTP, KYC, multi-role dashboard** semua berjalan
- **QRIS Mayar.id** terintegrasi (live + sandbox)
- **Peta interaktif 3 layer** hidup + **Kalkulator Estimasi Carbon**
- **AI chatbot NVIDIA NIM** aktif + **Dashboard Analisis AI** (NVIDIA + OpenRouter fallback)
- **Custom domain `id-map.app`** dengan DDoS protection (Cloudflare proxy + Bot Fight Mode)
- **Production-grade rate limit** via Upstash Redis (multi-instance correct)
- **CAPTCHA Turnstile** di register endpoint
- **Cloud Run-ready** — Dockerfile + cloudbuild.yaml siap deploy ke Google Cloud
- **Deploy** di Vercel + Convex Cloud + Cloudinary (publik dapat diakses)

## Akun Demo (untuk Penilai)

| Role        | URL Login                                              | Email                      | Password   |
| ----------- | ------------------------------------------------------ | -------------------------- | ---------- |
| Sahabat     | https://www.id-map.app/masuk                           | user@idmap.id              | user123    |
| Mitra       | https://www.id-map.app/masuk                           | mitra@idmap.id             | mitra123   |
| Verifikator | https://www.id-map.app/masuk/verifikator               | verifikator@idmap.id       | verif123   |
| Admin       | https://www.id-map.app/masuk/admin                     | admin@idmap.id             | admin123   |

Tombol **"Isi Otomatis"** tersedia di tiap halaman login. Akun dibuat on-demand pertama kali login.

## Fitur Utama Yang Sudah Berjalan

### Layanan publik
- Landing page + 3 layer peta mangrove interaktif (`/jelajahi-peta-mangrove`)
- Kalkulator Estimasi Carbon (`/uji-coba-peta`)
- Halaman edukasi ekosistem pesisir (`/edukasi-ekosistem-pesisir`)
- AI Chatbot CS multilingual (NVIDIA NIM, fallback OpenRouter)
- Donasi QRIS via Mayar.id (`/donasi-cepat/[projectId]`)

### Dashboard Sahabat (`/user`)
- Donasi, riwayat transaksi, sertifikat, KYC submission, dampak personal

### Dashboard Mitra (`/mitra`)
- Submit proyek baru, MRV report, SRN status, pendanaan, KYC organisasi

### Dashboard Verifikator (`/verifikator`)
- Verifikasi POKMASWAS, abrasi pantai, populasi penyu
- Edit konten landing/about/FAQ/footer (real-time via Convex live query)

### Dashboard Admin (`/admin`)
- Manajemen pengguna, proyek, transaksi, SRN, laporan, analitik
- Konsol konfigurasi platform

## Audit Keamanan & Kualitas Yang Telah Dilakukan

### 1. Otentikasi & Sesi (Confirmed)
- [x] **HttpOnly cookie session** (HMAC-SHA256, TTL 7 hari, SameSite=Lax)
- [x] **Edge runtime middleware** verifikasi token sebelum render React (proteksi `/admin`, `/verifikator`, `/mitra`, `/corporate`, `/user`)
- [x] **Bcrypt password hashing** (cost factor 10) di Convex mutation
- [x] **Lazy migration** plaintext → bcrypt saat login pertama kali
- [x] **Throw di production** jika `SESSION_SECRET` env kosong/<32 char ([sessionToken.ts:26-28](src/lib/sessionToken.ts#L26))
- [x] **Fail-closed middleware** redirect ke login jika SECRET tidak valid di prod ([middleware.ts:88-100](src/middleware.ts#L88))
- [x] **Portal login terpisah** untuk Verifikator (`/masuk/verifikator`) dan Admin (`/masuk/admin`) — entry-point tidak diiklankan di halaman publik
- [x] **`requireSession` & `requireRole` helpers** di `src/lib/serverSession.ts` untuk handler API ([serverSession.ts:36-78](src/lib/serverSession.ts#L36))

### 2. DDoS Protection & Rate Limiting (Confirmed — production tested)
- [x] **Cloudflare proxy** di depan custom domain `id-map.app` — DDoS L3-L7 protection (free tier)
- [x] **Bot Fight Mode** aktif — terbukti block 99% request curl dalam stress test
- [x] **SSL Full (strict)** + TLS 1.2 minimum + Always Use HTTPS
- [x] **Cloudflare Turnstile CAPTCHA** di `/api/auth/register` — tested: tolak 50/50 request tanpa token
- [x] **Upstash Redis sliding window** rate limit (multi-instance correct di Vercel serverless)
- [x] **Dual API**: `rateLimit()` (sync, in-memory) + `rateLimitAsync()` (Redis-backed) di [src/lib/rateLimit.ts](src/lib/rateLimit.ts)
- [x] **Health endpoint** `/api/health` untuk verifikasi backend (gated by `ADMIN_API_TOKEN`)

Sliding-window rate limiter Redis-backed aktif di **11 endpoint kritis**:

| Endpoint                        | Bucket             | Limit                  |
| ------------------------------- | ------------------ | ---------------------- |
| `/api/auth/login`               | email + IP         | 10/15min · 30/15min    |
| `/api/auth/register`            | IP + email         | 10/jam · 3/jam         |
| `/api/auth/send-otp`            | email + IP         | 5/jam · 15/jam         |
| `/api/payment/create-qris`      | IP                 | 10/jam                 |
| `/api/payment/create-invoice`   | IP                 | 5/jam                  |
| `/api/payment/status`           | IP                 | 240/5min               |
| `/api/payment/simulate`         | IP                 | 20/jam                 |
| `/api/payment/register-webhook` | IP                 | 10/jam                 |
| `/api/chat`                     | IP                 | 20/menit               |
| `/api/mangrove-analysis`        | IP                 | 10/menit               |
| `/api/cloudinary-upload`        | user uid           | 30/jam                 |

**Stress test terverifikasi:**
- Bot register 50 req → 50/50 block via Turnstile (`400 Verifikasi CAPTCHA gagal`)
- Volumetric homepage 100 req curl → 99/100 block via Cloudflare Bot Fight Mode (`403 Forbidden`)
- Rate limit Redis 5 req/30 detik → req 6,7 confirmed `ok=false` dengan `retryAfterMs` correct

### 3. Webhook & Integrasi Pembayaran (Confirmed)
- [x] **HMAC-SHA256 verify** untuk webhook Mayar.id (`x-mayar-signature` + `Authorization: Bearer`)
- [x] **Timing-safe compare** untuk admin tokens (`ADMIN_API_TOKEN`)
- [x] **Sandbox guard** di `/api/payment/simulate` (hanya aktif jika `MAYAR_SANDBOX=true`)
- [x] **Idempotent payment confirmation** via `paymentId` lookup

### 4. Convex Authorization (Confirmed)
- [x] **`requireRole`/`requireAdmin`/`requireOwnerOrAdmin`** helpers di `convex/authz.ts`
- [x] **Public-safe user shape** — password tidak pernah di-return ke client (`toPublicUser()`)
- [x] **Validator role** enum strict di schema (sahabat, mitra, mitra_facilitator, verifikator, admin, corporate)
- [ ] **TD-14:** Mutation pakai `actorId: v.id("users")` dari client — perlu refactor ke `internalMutation` + Next.js gateway untuk pilot stage. Sudah didokumentasikan sebagai known-debt di [convex/authz.ts:6-10](convex/authz.ts#L6).

### 5. Upload & Storage (Confirmed)
- [x] **Auth gating** di `/api/cloudinary-upload` (login wajib)
- [x] **MIME + extension whitelist** (jpg/png/webp/avif)
- [x] **Max 5 MB** per upload
- [x] **Per-user rate limit** (30/jam, Redis-backed)

### 6. AI Endpoint Hardening (Confirmed)
- [x] **Strip system messages dari user input** di `/api/chat` (mitigasi prompt injection)
- [x] **Hanya 6 message terakhir** dikirim ke model (cost guardrail)
- [x] **Multi-model fallback chain** (NVIDIA → OpenRouter) untuk reliability
- [x] **Markdown stripping** di chat response (anti-formatting injection)
- [x] **Rate limit per IP** Redis-backed (anti-drain quota AI provider)

### 7. HTTP Security Headers (Confirmed di production)

Custom domain `https://www.id-map.app` (production headers terverifikasi via curl):

- [x] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=()`
- [x] `X-DNS-Prefetch-Control: on`
- [x] `Server: cloudflare` + `CF-RAY` (traffic via Cloudflare edge)

### 8. Logging & Observability (Confirmed)
- [x] Structured logger ([src/lib/logger.ts](src/lib/logger.ts)) untuk semua API route
- [x] Audit log untuk: login_ok / login_failed / rate_limited / register_ok / register_captcha_failed / payment_confirmed / webhook_rejected / dll
- [x] Request duration tracking (`durationMs`)
- [x] Stack trace di error response (server-only, tidak bocor ke client)

## Cloud Run Deployment Readiness

Repository siap deploy ke **Google Cloud Run** kapan saja:

- [x] [Dockerfile](Dockerfile) — multi-stage build Node 20 Alpine, port 8080
- [x] [cloudbuild.yaml](cloudbuild.yaml) — build config asia-southeast2 region
- [x] [CLOUD_RUN_DEPLOY.md](CLOUD_RUN_DEPLOY.md) — panduan deploy lengkap
- [x] [.env.example](.env.example) — daftar env vars yang perlu di-set
- [x] [DDOS_BOT_PROTECTION_SETUP.md](DDOS_BOT_PROTECTION_SETUP.md) — panduan setup Upstash & Turnstile

Command deploy:
```bash
gcloud builds submit --tag asia-southeast2-docker.pkg.dev/PROJECT_ID/REPO/id-map
gcloud run deploy id-map \
  --image asia-southeast2-docker.pkg.dev/PROJECT_ID/REPO/id-map \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --port 8080
```

## Known Debt (Roadmap ke Pilot)

| ID    | Item                                                                       | Priority | Status      | Plan                                                |
| ----- | -------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------- |
| TD-1  | Register endpoint tetap menerima role apapun untuk demo juri               | High     | By design   | Restrict ke `["sahabat"]`, pisah `/api/admin/users` saat pilot |
| TD-14 | Convex mutation pakai `actorId-from-client`                                | High     | Open        | Migrate ke `internalMutation` + Next.js gateway     |
| TD-2  | Rate limit in-memory (per-instance)                                        | Medium   | **Done**    | ✅ Migrated ke Upstash Redis sliding window         |
| TD-3  | TypeScript & ESLint dimatikan saat build                                   | Medium   | Open        | Re-enable + GitHub Action gate                      |
| TD-4  | Content Security Policy (CSP) belum di-set strict                          | Medium   | Open        | Inventarisasi domain → CSP whitelist                |
| TD-5  | Test coverage e2e (Playwright) hanya 5 file                                | Low      | Open        | Tambah coverage dashboard CRUD                      |
| TD-6  | Konsolidasi UI komponen yang duplikat antar dashboard                      | Low      | Open        | Shared `<DataTable>`, `<DetailCard>`                |
| TD-15 | Custom domain SSL dari Cloudflare proxy                                    | Medium   | **Done**    | ✅ id-map.app live dengan Cloudflare Full strict    |
| TD-16 | DDoS protection                                                            | High     | **Done**    | ✅ Cloudflare Bot Fight Mode + Turnstile            |

Audit lengkap: [investigations/idmap-audit-tahap2-investigation.md](investigations/idmap-audit-tahap2-investigation.md)

## Stack & Infrastruktur

- **Frontend:** Next.js 14.2.35 (App Router), React 18, TailwindCSS, lucide-react
- **Backend:** Convex (serverless functions + real-time DB)
- **Hosting:** Vercel (production) + Convex Cloud
- **Storage:** Cloudinary (image uploads)
- **Payment:** Mayar.id (QRIS + Invoice + webhook)
- **AI:** NVIDIA NIM (primary) + OpenRouter (fallback)
- **Email:** Gmail SMTP via nodemailer (OTP)
- **Maps:** MapLibre GL + GeoJSON 3-layer

## Daftar Halaman

134 file di `src/`, 14 tabel Convex, 15 API route. Detail SYSTEM_MAP.md di repo.

---

*Dokumen ini bersifat hidup. Update setiap kali fitur baru atau audit selesai.*
