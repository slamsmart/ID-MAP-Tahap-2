# Investigation: Audit Menyeluruh ID-MAP Tahap 2

## Hand-off Brief

1. **What happened.** Audit ID-MAP Tahap 2 (134 src files Next 14 + Convex) menemukan jalur privilege-escalation publik via `/api/auth/register` (admin/verifikator role di-accept dari client tanpa gating, P0) plus payment endpoints (`create-qris`, `create-invoice`) yang terbuka tanpa autentikasi/rate-limit (P0).
2. **Where the case stands.** Outcome 5 selesai. 8 finding ter-grade Confirmed: 3 P0, 2 P1, 3 P2. 2 hipotesis Refuted (SESSION_SECRET fallback aman karena throw, SessionGuard logic OK untuk usage saat ini). Repro curl tersedia.
3. **What's needed next.** Patch P0 #1 (`register` lock role + rate limit + hapus auto-register demo client) — 30 menit kerja, blokir blast radius terbesar. Lalu P0 #2 (rate limit payment) — 15 menit. Sisanya bisa di-sprint terjadwal.

## Case Info

| Field            | Value                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Ticket           | N/A (eksplorasi)                                                           |
| Date opened      | 2026-05-31                                                                 |
| Status           | Active                                                                     |
| System           | Next.js 14.2.35 · Convex · Vercel (idmap-pesisir.vercel.app)                |
| Evidence sources | src/, convex/, middleware.ts, git log                                      |

## Problem Statement

Audit menyeluruh: arsitektur auth, security boundary, kualitas code, struktur file, rekomendasi.

## Evidence Inventory

| Source                                       | Status     | Notes                                                                          |
| -------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| src/middleware.ts                            | Read       | HMAC verify edge-runtime                                                       |
| src/lib/sessionToken.ts                      | Read       | HMAC-SHA256, throw di prod jika SESSION_SECRET kosong                          |
| src/lib/serverSession.ts                     | Read       | cookies() wrapper                                                              |
| src/lib/rateLimit.ts                         | Read       | In-memory Map (per-instance, hilang saat lambda restart)                       |
| src/lib/auth.ts                              | Read       | Client cache + /api/auth/me bootstrap                                          |
| src/components/shared/SessionGuard.tsx       | Read       | loginPathFor() simple if-chain                                                 |
| src/app/api/auth/login/route.ts              | Read       | Dual rate limit (email+IP), bcrypt via Convex                                  |
| src/app/api/auth/register/route.ts           | Read       | **Tanpa auth, tanpa rate limit, role bebas**                                   |
| src/app/api/auth/me/route.ts                 | Read       | Cookie session → user                                                          |
| src/app/api/auth/logout/route.ts             | Read       | Clear cookie                                                                   |
| src/app/api/auth/send-otp/route.ts           | Read       | Dual rate limit OK, Gmail SMTP                                                 |
| src/app/api/chat/route.ts                    | Read       | Rate limit per IP (20/menit), tanpa auth                                       |
| src/app/api/mangrove-analysis/route.ts       | Read       | Rate limit per IP (10/menit), tanpa auth                                       |
| src/app/api/payment/create-qris/route.ts     | Read       | **Tanpa auth, tanpa rate limit, amount min 1000**                              |
| src/app/api/payment/webhook/route.ts         | Read       | HMAC + Bearer verify (OK)                                                      |
| convex/users.ts                              | Read       | bcrypt hash + login mutation, **role di-pass dari client di create()**         |
| convex/authz.ts                              | Read       | requireRole/requireAdmin pakai actorId dari client (TD-14)                     |
| convex/schema.ts                             | Read       | 14 tables, role enum 6 nilai                                                   |
| next.config.mjs                              | Read       | **ignoreBuildErrors=true & ignoreDuringBuilds=true** (TS/ESLint dimatikan)     |
| getServerSession callers                     | Searched   | Hanya 3 file (auth/me, ?, ?) — banyak API route tidak pakai session            |
| SessionGuard usages                          | Searched   | 5 layout, semua single-role array                                              |

## Investigation Backlog

| #  | Path to Explore                                                            | Priority | Status      | Notes                                              |
| -- | -------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------- |
| 1  | sessionToken HMAC implementation                                           | High     | Done        | Confirmed: throw di prod jika SECRET kosong        |
| 2  | rateLimit backing store                                                    | High     | Done        | In-memory Map — multi-instance bocor               |
| 3  | convex/users.ts register mutation                                          | High     | Done        | role free-form di `create()`                       |
| 4  | convex/authz.ts                                                            | High     | Done        | TD-14 acknowledged: actorId trustless              |
| 5  | /api/auth/register privilege escalation                                    | High     | **Confirmed**| P0 — publik, terima role apapun                   |
| 6  | /api/auth/me payload                                                       | Medium   | Done        | Hanya {_id, email, name, role} — OK                |
| 7  | SessionGuard loginPathFor edge cases                                       | Medium   | Done        | Hanya single-role usages — saat ini OK             |
| 8  | Middleware proteksi /api/*                                                 | High     | **Confirmed**| matcher tidak cover /api — tiap handler harus self|
| 9  | /api/payment/* auth check                                                  | High     | **Confirmed**| create-qris tanpa auth/rate limit                  |
| 10 | /api/chat & /api/mangrove-analysis                                         | Medium   | Done        | Rate limit per IP OK, tanpa auth (acceptable)      |
| 11 | next.config security headers                                               | Medium   | **Finding** | Tidak ada CSP/HSTS/X-Frame-Options                 |
| 12 | SESSION_SECRET fallback                                                    | High     | **Refuted** | sessionToken.ts:26 throw di NODE_ENV=production    |
| 13 | Demo account auto-register di /masuk/admin                                 | High     | **Confirmed**| Bisa create admin baru kapanpun via UI          |
| 14 | TypeScript strict & ignoreBuildErrors                                      | Medium   | **Finding** | next.config.mjs:6-7 ignore build errors            |
| 15 | Tests coverage                                                             | Low      | Open        | tests/e2e/ — belum diaudit                         |
| 16 | KYC upload endpoint /api/cloudinary-upload                                 | Medium   | Open        | Belum dibaca                                       |

## Timeline of Events

| Time            | Event                                                       | Source              | Confidence |
| --------------- | ----------------------------------------------------------- | ------------------- | ---------- |
| commit 0c3891d  | feat(security): HttpOnly cookie session, structured logs    | git log             | Confirmed  |
| commit 48e48cb  | sec: pentest P0/P1 fixes — Convex authz, AI rate limit      | git log             | Confirmed  |
| commit 5378ad0  | feat(auth): split admin & verifikator login portals         | this session        | Confirmed  |
| commit 0a88c74  | refactor(auth): nest /masuk/{admin,verifikator}             | this session        | Confirmed  |

## Confirmed Findings

### Finding 1: Privilege escalation publik via /api/auth/register

**Evidence:** `src/app/api/auth/register/route.ts:14,27,40-47`

```ts
const ALLOWED_ROLES = new Set(["sahabat", "mitra", "verifikator", "admin", "corporate"]);
// ...
if (!email || !password || !name || !ALLOWED_ROLES.has(role)) ...
userId = await convex.mutation(api.users.create, { email, password, name, role, ... });
```

**Detail:** Endpoint POST `/api/auth/register` menerima `role` dari body request, hanya validasi enum (whitelist memuat `"admin"` dan `"verifikator"`), lalu langsung create user di Convex + set HttpOnly cookie. **Siapa pun di internet** bisa POST `{email:"x@y.z", password:"abc123", name:"a", role:"admin"}` → mendapatkan akun admin valid + session aktif. Tidak ada rate limit, tidak ada CAPTCHA, tidak ada email verification gate.

**Severity:** P0 — Critical privilege escalation.

### Finding 2: Demo auto-register di portal login admin/verifikator memperbesar attack surface

**Evidence:** `src/app/masuk/admin/page.tsx:96-117`, `src/app/masuk/verifikator/page.tsx:99-117`

**Detail:** Halaman login admin punya logic: jika user mengetik kredensial demo persis (`admin@idmap.id`/`admin123`) dan login gagal, client memanggil `/api/auth/register` dengan `role: "admin"`. Karena Finding 1 → endpoint register tidak gating, ini selalu sukses. Akun demo admin bisa di-recreate berkali-kali, dan attacker bisa pakai endpoint yang sama tanpa lewat UI.

**Severity:** P0 (sebagai amplifier Finding 1).

### Finding 3: API payment/create-qris tanpa autentikasi & tanpa rate limit

**Evidence:** `src/app/api/payment/create-qris/route.ts:22-105`

**Detail:** Handler tidak pernah memanggil `getServerSession()`. Body `userId` opsional dan langsung di-cast ke `Id<"users">` tanpa verify. Tidak ada `rateLimit()` call. Konsekuensi:
- Anonymous: bisa drain Mayar.id API quota dengan loop POST.
- Bisa attribute donasi ke userId orang lain (`userId: <victim>`), efek UX/laporan.
- Cost berdampak ke billing Mayar (kalau live mode).

**Severity:** P0 financial / abuse vector.

### Finding 4: Convex mutation pakai pola actorId-from-client (TD-14 acknowledged)

**Evidence:** `convex/authz.ts:6-10`, `convex/users.ts:225,269` (`update`, `remove` accept `actorId: v.id("users")`)

**Detail:** Komentar di `authz.ts:6-10` mengakui ini bukan proteksi penuh: penyerang yang tahu `actorId` admin (mis. dari `/api/auth/me` response milik admin yang sedang login di same-origin) bisa POST mutation Convex langsung sebagai admin. Convex mutations adalah public surface — tidak ada gateway server-side untuk mutation ini.

**Severity:** P1 — Risk medium (perlu kombinasi dengan info-leak), tapi pola sistemik di banyak mutation.

### Finding 5: Build errors disabled di next.config.mjs

**Evidence:** `next.config.mjs:3-8`

```js
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true },
```

**Detail:** TypeScript & ESLint errors tidak fail build. Bug type-level dapat lolos ke production tanpa peringatan. Audit kualitas code menjadi ketergantungan pada pre-commit hooks (yang tidak terlihat) atau CI eksternal.

**Severity:** P2 — Quality gate.

### Finding 6: Rate limit in-memory tidak konsisten di serverless

**Evidence:** `src/lib/rateLimit.ts:10-46`

**Detail:** `stores: Map<string, WindowEntry>` adalah module-level state. Vercel function instance baru = Map kosong. Rate limit per email/IP secara efektif berkali lipat dari nilai konfigurasi karena tiap warm invocation baru reset. Komentar di file akui ini tradeoff demo. Untuk production: Upstash Redis / Convex.

**Severity:** P2 — Defense weakening, bukan bypass total.

### Finding 7: Middleware tidak menjaga `/api/*`

**Evidence:** `src/middleware.ts:106-114`

```js
matcher: ["/admin/:path*", "/verifikator/:path*", "/mitra/:path*",
         "/corporate/:path*", "/user/:path*"]
```

**Detail:** API routes bukan domain middleware ini. Tiap handler di `src/app/api/**` harus self-protect dengan `getServerSession()` + role check. Audit: dari ~15 route, hanya ~3 yang panggil `getServerSession`. Sisanya open atau hanya rate-limited.

**Severity:** P1 — Sistemik. Lihat Finding 1, 3.

### Finding 8: Tidak ada security headers (CSP, HSTS, X-Frame, X-Content-Type)

**Evidence:** `next.config.mjs` (file lengkap, tidak ada `headers()`)

**Detail:** Default Next.js sudah set beberapa, tapi CSP, HSTS, X-Frame-Options, Referrer-Policy belum di-customize. Membuat clickjacking, MIME-sniff, dan downgrade attack lebih mudah.

**Severity:** P2 — Defense in depth.

## Deduced Conclusions

### Deduction 1: Sistem auth bocor di register, bukan login

**Based on:** Finding 1, 2, 7

**Reasoning:** Login route punya rate limit + bcrypt + Convex login mutation yang aman. Tapi register route bypass semua proteksi: tidak rate-limited, tidak gated, role-from-client. Karena register juga set cookie aktif → register adalah jalur masuk yang lebih cepat dari brute-force login. Penyerang tidak perlu menebak password admin; mereka cukup buat admin baru.

**Conclusion:** Register adalah single point of failure utama. Fix di register lebih impactful dari memperkuat login.

### Deduction 2: Convex public mutation surface = de-facto API publik

**Based on:** Finding 4, 7

**Reasoning:** Convex tidak punya middleware request-level. Mutations yang accept `actorId: v.id("users")` rely on caller honesty. Karena `/api/auth/me` endpoint memang return user `_id` ke client (legit, dipakai SessionGuard), `actorId` admin bisa di-extract dari shared device, MITM (kalau secure flag tidak terpakai), atau intercept proxy. Convex direct call dari browser console juga bisa dilakukan dengan SDK URL yang ada di env public.

**Conclusion:** Mutation sensitif (delete user, update KYC, project verify) butuh server gateway via Next.js API route + `getServerSession()` + Convex `internalMutation`. Pola TD-14 di komentar adalah jalur fix yang sudah disepakati.

## Hypothesized Paths

### Hypothesis 1: Privilege escalation via /api/auth/register

**Status:** **Confirmed** (Finding 1).

**Resolution:** Evidence di `register/route.ts:40-47` — role di-pass dari client dan hanya divalidasi via enum whitelist yang memuat admin & verifikator.

### Hypothesis 2: SESSION_SECRET fallback bocor ke prod

**Status:** **Refuted**.

**Resolution:** `sessionToken.ts:26-28` throw `Error` di production jika `SESSION_SECRET` kosong/<32 char. Middleware (`middleware.ts:83-85`) masih punya fallback string, tapi karena server-side route lain akan gagal init, app tidak bisa serve auth → produksi sudah punya secret ter-set (commit history `0c3891d` "HttpOnly cookie session"). Risk: middleware fallback masih ada (defense gap kecil) — pindahkan ke shared helper.

### Hypothesis 3: Rate limit in-memory tidak efektif

**Status:** **Confirmed** (Finding 6).

**Resolution:** Map module-level. Vercel serverless tidak share memory across invocations.

### Hypothesis 4: SessionGuard loginPathFor mismatch

**Status:** **Refuted (saat ini)**.

**Resolution:** Semua usage saat ini single-role array (`["admin"]`, `["verifikator"]`, `["mitra"]`, `["sahabat"]`). Logic `loginPathFor()` cocok. Tetap rapuh untuk perubahan future — ada side finding.

### Hypothesis 5: Middleware tidak proteksi /api/*

**Status:** **Confirmed** (Finding 7).

**Resolution:** matcher hanya halaman; API self-protect via `getServerSession()` — sebagian besar tidak.

## Missing Evidence

| Gap                                            | Impact                                            | How to Obtain               |
| ---------------------------------------------- | ------------------------------------------------- | --------------------------- |
| Vercel env vars production list                | Konfirmasi SESSION_SECRET set                      | `vercel env ls production`  |
| Audit cloudinary-upload endpoint               | Potensi unauthenticated upload                     | Read route handler          |
| Audit `/api/auth/me` rate limit                | Apakah enumeration possible?                       | Inspect handler             |
| Test coverage scope                            | Validasi regression net                            | Read tests/e2e/             |

## Source Code Trace (Outcome 4)

### Trace 1 — Privilege escalation publik (Finding 1, P0)

| Element       | Detail                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| Error origin  | `src/app/api/auth/register/route.ts:14` (ALLOWED_ROLES whitelist memuat admin/verifikator) |
| Trigger       | POST `/api/auth/register` dengan `role` arbitrary                                    |
| Condition     | Tidak ada gate auth/CAPTCHA/email-verify; cookie session di-set langsung             |
| Related files | `convex/users.ts:156-192` (create mutation tidak verify caller authority)            |

**Fix points:**
- `register/route.ts:14` → restrict ALLOWED_ROLES menjadi `["sahabat"]` only untuk public registration
- `register/route.ts:16` → tambah rate limit per IP (5/jam) + per email (3/hari)
- Buat `/api/admin/users/create` terpisah dengan `getServerSession()` + `requireAdmin` untuk admin-side user provisioning
- `convex/users.ts:create` → split menjadi `createPublic` (force role=sahabat) + `createInternal` (internal mutation, role bebas)
- `src/app/masuk/admin/page.tsx:96-117` & `src/app/masuk/verifikator/page.tsx:99-117` → hapus auto-register demo branch (bagian client-side)

### Trace 2 — Payment endpoint open (Finding 3, P0)

| Element       | Detail                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| Error origin  | `src/app/api/payment/create-qris/route.ts:22-105` (no auth, no rate limit)   |
| Trigger       | POST `/api/payment/create-qris` dengan `amount + projectId`                  |
| Condition     | Anonymous reachable; Mayar API quota & internal Convex mutation drainable    |
| Related files | `src/app/api/payment/create-invoice/route.ts:13-128` (juga tanpa auth)       |

**Fix points:**
- `create-qris/route.ts` → tambah `rateLimit({ bucket: "qris:ip", limit: 10, windowMs: 3600000 })`
- Optional auth: jika `userId` provided → wajib match `getServerSession().uid`; jika anonymous → boleh tapi tag lebih ketat
- `create-invoice/route.ts` → mirror policy yang sama
- `payment/status/route.ts` → ada komentar "public no auth" yang OK tapi tambah rate limit ringan untuk hindari enumeration

### Trace 3 — Convex mutation actorId trustless (Finding 4, P1)

| Element       | Detail                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| Error origin  | `convex/authz.ts:6-10` (komentar TD-14)                                      |
| Trigger       | Convex public mutation dengan `actorId: v.id("users")` di args               |
| Condition     | Penyerang tahu admin _id (dari profile leak / observation) → spoof actor     |
| Related files | `convex/users.ts:225,269`, semua mutation lain dengan pattern actorId        |

**Fix points (jangka panjang TD-14):**
- Pindahkan semua mutation sensitif ke `internalMutation` yang dipanggil dari Next.js API route
- Next.js route validate session via `getServerSession()`, lalu pass session.uid sebagai `actorId` (server-controlled)
- Convex public action via `convex/auth` integration jika ingin Convex Auth native

### Trace 4 — Middleware coverage gap (Finding 7, P1)

| Element       | Detail                                                              |
| ------------- | ------------------------------------------------------------------- |
| Error origin  | `src/middleware.ts:106-114` (matcher only halaman)                  |
| Trigger       | Request ke `/api/*` route                                            |
| Condition     | Setiap handler harus self-protect; sebagian besar belum                  |
| Related files | semua `src/app/api/**/route.ts`                                      |

**Fix points:**
- Pilihan A: tambah `/api/admin/:path*`, `/api/internal/:path*` ke matcher dengan role guard
- Pilihan B: extract `requireSession()` helper, panggil di setiap handler sensitif
- Audit checklist: 13 API route → minimal 8 perlu auth (register, payment/*, mangrove-analysis [user-bound], chat [optional])

### Trace 5 — Rate limit scaling (Finding 6, P2)

| Element       | Detail                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Error origin  | `src/lib/rateLimit.ts:10` (Map module-level)                          |
| Trigger       | Tiap Vercel function instance baru = counter reset                     |
| Condition     | High-traffic atau distributed attack akan bypass                       |

**Fix points:**
- Migrate ke Upstash Redis (10K free req/hari) atau Convex `rateLimits` table
- Drop-in shape: `rateLimit({ bucket, key, limit, windowMs })` tetap, ganti backing store
- Prioritas: login, register, payment endpoints first

### Trace 6 — TypeScript & ESLint dimatikan (Finding 5, P2)

| Element       | Detail                                                              |
| ------------- | ------------------------------------------------------------------- |
| Error origin  | `next.config.mjs:3-8`                                                |
| Trigger       | Build di Vercel                                                      |
| Condition     | TS errors lewat senyap                                                |

**Fix points:**
- Hapus `ignoreBuildErrors`, jalankan `tsc --noEmit` dulu di GitHub Action sebagai pre-merge gate
- ESLint: aktifkan untuk PR-only (build still passes locally jika warning)

### Trace 7 — Security headers belum di-set (Finding 8, P2)

| Element       | Detail                                                              |
| ------------- | ------------------------------------------------------------------- |
| Error origin  | `next.config.mjs` (tidak ada `headers()` async)                      |
| Trigger       | Setiap response                                                      |

**Fix points:** Tambah `headers()` di `next.config.mjs`:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (jika tidak dipakai)
- CSP: setelah inventarisasi domain (Mayar, Cloudinary, Convex, NVIDIA, OpenRouter)

## Side Findings

- `src/app/api/payment/status/route.ts:11` — endpoint public tanpa rate limit, bisa enumerate `contributionId` untuk cek status. Risiko rendah (info minimal: paymentStatus saja).
- `src/middleware.ts:84-85` — fallback string secret masih ada. `sessionToken.ts` sudah throw, tapi middleware path tidak berinteraksi dengan helper itu. Saran: pindahkan secret resolution ke helper bersama yang juga throw di prod.
- `src/app/api/payment/simulate/route.ts:26-31` — guard `MAYAR_SANDBOX !== "true"` bagus, tapi value env ini hidup di Vercel. Pastikan `MAYAR_SANDBOX` tidak ke-set di production env.
- `src/app/api/payment/create-invoice/route.ts:74` — fallback redirectUrl hardcode `id-map-national.vercel.app` (bukan `idmap-pesisir.vercel.app`). Stale config.
- `src/app/api/auth/register/route.ts:62` → `role as any` cast lewatkan type checking. Defensive: keep enum type lock.
- `convex/users.ts:218` → lazy migration plaintext → bcrypt OK, tapi return user dengan `password: newHash`. `toPublicUser` strip ini, jadi aman, tapi flow sedikit memutar.
- `tsconfig.json` belum diaudit — apakah `strict: true` aktif? Jika ya, value plus dari Finding 5.
- `tests/e2e/` ada 5 file — coverage belum dihitung.
- 134 file `src/`, hanya 23 components shared — kemungkinan duplikasi UI antar dashboard (admin/mitra/verifikator) yang punya page list/detail mirip. Refactor ke shared `<DataTable>`/`<DetailCard>` bisa kurangi maintenance.

## Conclusion

**Confidence:** **High** untuk Finding 1, 3, 5, 6, 7, 8. **Medium** untuk Finding 4 (sistemik, fix membutuhkan rewrite). **High** untuk refutasi Hypothesis 2 & 4.

**Root cause utama:** Public registration endpoint (`/api/auth/register`) tidak gating role → privilege escalation tersedia tanpa friction. Diperburuk oleh demo auto-register di portal login admin yang membuat exploit terlihat seperti fitur normal.

**Sekunder:** Payment endpoints terbuka tanpa auth/rate-limit, dan pola Convex `actorId-from-client` masih sistemik di mutation sensitif.

## Recommended Next Steps

### Fix direction (priority order)

**P0 — Critical, blokir registrasi/escalation:**
1. **`/api/auth/register`** → `ALLOWED_ROLES = new Set(["sahabat"])`. Tambah rate limit per IP + email. Hapus auto-register demo dari portal admin/verifikator. Buat `/api/admin/users/create` terpisah untuk admin provisioning.
2. **`/api/payment/create-qris` & `/api/payment/create-invoice`** → tambah `rateLimit({ bucket: "qris:ip", limit: 10, windowMs: 3600000 })`. Optional: enforce session jika `userId` di-set.

**P1 — High, harden mutation surface:**
3. **Convex mutation TD-14** → pindahkan mutation sensitif (`users.update`, `users.remove`, KYC review, project verify) ke `internalMutation`, panggil dari Next.js API route yang verify session terlebih dahulu.
4. **Middleware coverage** → extract `requireSession()` helper di `src/lib/serverSession.ts`, audit semua `src/app/api/**/route.ts`, tambah panggilan di handler sensitif.

**P2 — Medium, defense in depth:**
5. **Migrate rateLimit ke Upstash Redis atau Convex table** untuk multi-instance correctness.
6. **next.config.mjs** → hapus `ignoreBuildErrors` & `ignoreDuringBuilds`. Tambah security headers (HSTS, CSP, X-Frame, dll).
7. **Cleanup `src/middleware.ts:84-85`** secret fallback.

**Quality:**
8. Audit `tsconfig.json` strict mode.
9. Hitung test coverage `tests/e2e/`.
10. Konsolidasi UI components yang duplikat antar dashboard.

### Diagnostic plan untuk konfirmasi P0 di production

```bash
# Test 1: konfirmasi privilege escalation (P0 #1)
curl -X POST https://idmap-pesisir.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"audit-test@example.com","password":"audit12345","name":"Audit","role":"admin"}' \
  -i
# Expected (vulnerable): 200 dengan Set-Cookie idmap_sess=...
# Expected (fixed): 400 atau 403

# Test 2: konfirmasi payment open (P0 #2)
curl -X POST https://idmap-pesisir.vercel.app/api/payment/create-qris \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"projectId":"<any_valid_project_id>"}' \
  -i
# Expected (vulnerable): 200 dengan paymentId
```

Setelah diagnostic, jika P0 #1 confirmed → patch terlebih dulu sebelum melakukan tindakan lain.

## Reproduction Plan

### Repro 1: privilege escalation
1. Buka https://idmap-pesisir.vercel.app
2. DevTools console: `fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"x@y.z",password:"abc12345",name:"X",role:"admin"})}).then(r=>r.json()).then(console.log)`
3. Refresh → SessionGuard membaca cookie → `getDashboardPath("admin") = "/admin"` → akses penuh

### Repro 2: payment abuse
1. Tanpa login, loop POST `/api/payment/create-qris` dengan `amount=1000, projectId=<any>`
2. Tiap iteration → contribution pending baru di Convex + (jika live) hit Mayar API

## Status

**Active** — siap untuk fix sprint. Diagnostic curl dapat dijalankan sebelum start untuk konfirmasi.
