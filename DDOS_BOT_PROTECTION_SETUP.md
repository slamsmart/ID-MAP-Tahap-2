# Setup DDoS / Bot Protection — ID-MAP

Dua layer proteksi siap pakai. **Setup butuh ~25 menit total. Tanpa env yang ter-set, fungsi normal jalan terus** (auto-fallback ke in-memory rate limit, CAPTCHA widget hidden).

## Layer 1 — Upstash Redis Rate Limit (10 menit, gratis)

Tujuan: rate limit jadi multi-instance correct. Counter tidak reset tiap cold start Vercel.

### Step 1: Buat akun Upstash

1. Buka https://upstash.com → **Sign up** (login pakai GitHub paling cepat)
2. Setelah login, klik **Create Database**
3. Isi:
   - Name: `idmap-ratelimit`
   - Type: **Regional** (lebih murah, latency cukup untuk kita)
   - Region: **Singapore (ap-southeast-1)** — terdekat ke Vercel SGP
   - Eviction: **No eviction** (default)
4. Klik **Create**

### Step 2: Copy credentials

Di halaman database yang baru dibuat, scroll ke section **REST API**. Copy 2 nilai:
- `UPSTASH_REDIS_REST_URL` → format `https://xxx.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN` → string panjang dimulai dengan `A...`

### Step 3: Set env di Vercel

```bash
# Di local (powershell):
cd "d:/2026/7. VIBE CODING ETC/ID-MAP TAHAP 2 V.1.0/ID-MAP-Final"
npx vercel env add UPSTASH_REDIS_REST_URL production
# Paste URL → Enter
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste token → Enter

# Optional: tambah ke preview & development juga
npx vercel env add UPSTASH_REDIS_REST_URL preview
npx vercel env add UPSTASH_REDIS_REST_TOKEN preview
```

Atau via dashboard: https://vercel.com/slamsmarts-projects/idmap-pesisir/settings/environment-variables → **Add New** → paste 2 vars.

### Step 4: Redeploy

```bash
npx vercel --prod --yes
```

Done. Backend rate limit sekarang Redis-backed. Tidak perlu sentuh code.

**Verifikasi:** kalau buka `/api/auth/login` 30+ kali rapat dari 1 IP → harus block setelah limit. Sebelum setup ini, mungkin tidak block kalau kena instance berbeda.

---

## Layer 2 — Cloudflare Turnstile CAPTCHA (15 menit, gratis)

Tujuan: block bot di form register. Invisible challenge untuk user manusia (tidak mengganggu UX).

### Step 1: Daftar Cloudflare account

Kalau belum punya: https://dash.cloudflare.com/sign-up (gratis selamanya)

### Step 2: Bikin Turnstile site

1. Login Cloudflare → menu kiri **Turnstile** (atau https://dash.cloudflare.com/?to=/:account/turnstile)
2. Klik **Add site**
3. Isi:
   - **Site name:** `ID-MAP Production`
   - **Hostname:** `idmap-pesisir.vercel.app`
     (kalau nanti pakai custom domain, tambah `id-map.id` di list — bisa multiple)
   - **Widget Mode:** **Managed** (recommended — Cloudflare auto-pilih challenge level)
   - **Pre-Clearance:** Off
4. Klik **Create**

### Step 3: Copy credentials

Setelah create, dashboard akan tampilkan:
- **Site Key** → format `0x4AAAAAAA...` (publik, akan di-embed di HTML)
- **Secret Key** → format `0x4AAAAAAA...` (rahasia, server-only)

### Step 4: Set env di Vercel

```bash
npx vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
# Paste site key → Enter

npx vercel env add TURNSTILE_SECRET_KEY production
# Paste secret key → Enter

# Tambah ke preview kalau mau
npx vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY preview
npx vercel env add TURNSTILE_SECRET_KEY preview
```

### Step 5: Redeploy

```bash
npx vercel --prod --yes
```

Done. Widget CAPTCHA otomatis muncul di `/daftar`. Server `/api/auth/register` verify token sebelum accept registrasi.

**Verifikasi:**
- Buka https://idmap-pesisir.vercel.app/daftar
- Widget CAPTCHA Cloudflare harus tampil di bawah checkbox terms
- Submit tanpa centang CAPTCHA → tombol Daftar disabled
- Bot tanpa JS → request `/api/auth/register` ditolak dengan error "Verifikasi CAPTCHA gagal"

---

## Akun Demo Tetap Bekerja

Demo akun tidak terpengaruh — login pakai `admin@idmap.id`/`admin123` dst tetap normal:
- Login route tidak pakai CAPTCHA (hanya rate limit)
- Auto-register demo dari `/masuk/admin` & `/masuk/verifikator` melalui `/api/auth/register` → akan di-CAPTCHA. Untuk juri, edit ulang halaman ini supaya skip CAPTCHA untuk role admin/verifikator? Atau biarkan saja — juri tinggal sekali click challenge.

**Saran:** biarkan CAPTCHA juga untuk demo akun. Juri nyatanya hanya register sekali per role; sisanya langsung login. Tidak mengganggu.

---

## Kalau Mau Nanti: Cloudflare Full Proxy

Setelah punya custom domain (`id-map.id`):

1. Cloudflare dashboard → **Add Site** → masukkan `id-map.id`
2. Cloudflare scan DNS → import existing
3. Update nameserver di registrar (PANDI/niagahoster) → ke Cloudflare nameserver
4. Tunggu propagasi (~5-30 menit)
5. Di Cloudflare → SSL/TLS → set **Full (strict)**
6. Di Cloudflare → Security → **Bot Fight Mode = ON**, **Security Level = Medium**
7. Vercel dashboard → Settings → Domains → Add `id-map.id` → ikuti instruksi DNS

Setelah ini, semua traffic lewat Cloudflare → otomatis dapat:
- DDoS L3-L7 protection
- WAF dasar
- Bot Fight Mode (block known bad bots)
- Analytics serangan

**Catatan:** Jangan setup ini sebelum domain bener-bener Anda kontrol. Kalau salah set, situs bisa down.

---

## Cek Apa Yang Aktif

Tambahkan endpoint debug (opsional, di local saja):

```ts
// src/app/api/health/route.ts (jangan di-commit ke prod)
import { rateLimitBackend } from "@/lib/rateLimit";
import { isTurnstileEnabled } from "@/lib/turnstile";

export async function GET() {
  return Response.json({
    rateLimit: rateLimitBackend(),       // "redis" | "memory"
    turnstile: isTurnstileEnabled(),      // true | false
  });
}
```

Kunjungi `https://idmap-pesisir.vercel.app/api/health` setelah deploy → harus return `{ rateLimit: "redis", turnstile: true }`.

---

## Ringkasan Env Var

| Var                                | Tipe   | Sumber                     | Wajib? |
| ---------------------------------- | ------ | -------------------------- | ------ |
| `UPSTASH_REDIS_REST_URL`           | Server | Upstash dashboard          | No (fallback in-memory) |
| `UPSTASH_REDIS_REST_TOKEN`         | Server | Upstash dashboard          | No |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`   | Public | Cloudflare Turnstile       | No (widget hidden)      |
| `TURNSTILE_SECRET_KEY`             | Server | Cloudflare Turnstile       | No (server skip verify) |

Tanpa keempat env ini ter-set, **app tetap jalan normal seperti sekarang** — hanya tanpa proteksi tambahan.
